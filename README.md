# 分帳服務資料庫設計

本文檔描述了分帳服務應用程式的資料庫結構。資料庫設計旨在支持通過 LINE LIFF 進行用戶交互，並利用 Supabase Edge Functions 處理後端邏輯。

## 核心原則

- **用戶身份驗證：** 由 Supabase Auth (`auth.users`) 管理，用戶記錄通過 Edge Function 使用 Admin API 創建，並與 LINE 用戶身份關聯。
- **用戶資料：** `public.profiles` 表存儲與 LINE Profile 相關的用戶公開信息，並通過 UUID 與 `auth.users` 關聯。
- **群組為中心：** 所有帳單都與特定的 LINE 群組關聯。
- **多付款人支持：** 帳單允許多個用戶共同支付。
- **結算流程：** 通過計算淨額並創建新的「內部轉帳」類型帳單來實現多筆帳單的批量結算，原始分攤記錄將被標記。
- **時間精度：** 交易和支付時間記錄到日期和時間。

## 資料庫表結構

### 1. `auth.users` (由 Supabase 自動管理)

此表由 Supabase Auth 系統管理，用於處理用戶身份驗證。

| 欄位名       | 類型          | 約束/描述                                                                                                                    |
| :----------- | :------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| `id`         | `UUID`        | **PK (Primary Key)**, Supabase Auth User ID.                                                                                 |
| `email`      | `VARCHAR`     | **UNIQUE**, 內部使用的、構造的唯一郵箱 (例如 `line_user_id@{your_internal_domain}` 或 `internal_{uuid}@yourapp.supabase.co`) |
| `created_at` | `TIMESTAMPTZ` | 記錄創建時間 (由 Supabase 管理)。                                                                                            |
| `updated_at` | `TIMESTAMPTZ` | 記錄更新時間 (由 Supabase 管理)。                                                                                            |
| `...`        | `...`         | 其他 Supabase Auth 系統自動管理的欄位 (如 `last_sign_in_at`, `email_confirmed_at` 等)。                                      |

### 2. `public.profiles`

存儲用戶的公開資料，主要來自 LINE Profile。

| 欄位名           | 類型           | 約束/描述                                                                             |
| :--------------- | :------------- | :------------------------------------------------------------------------------------ |
| `id`             | `UUID`         | **PK**, **FK** to `auth.users(id)` ON DELETE CASCADE. 與 `auth.users.id` 一對一關聯。 |
| `line_user_id`   | `VARCHAR(255)` | **UNIQUE, NOT NULL**. 原始的 LINE User ID (字符串)。                                  |
| `display_name`   | `VARCHAR(255)` | **NOT NULL**. LINE 顯示名稱。                                                         |
| `picture_url`    | `TEXT`         | NULLABLE. LINE 頭像 URL。                                                             |
| `status_message` | `TEXT`         | NULLABLE. LINE 狀態消息。                                                             |
| `created_at`     | `TIMESTAMPTZ`  | NOT NULL, DEFAULT `CURRENT_TIMESTAMP`.                                                |
| `updated_at`     | `TIMESTAMPTZ`  | NOT NULL, DEFAULT `CURRENT_TIMESTAMP`.                                                |

### 3. `public.groups`

記錄 LINE 群組的基本信息。

| 欄位名        | 類型           | 約束/描述                                                        |
| :------------ | :------------- | :--------------------------------------------------------------- |
| `group_id`    | `VARCHAR(255)` | **PK**. LINE Group ID (字符串), 從 LIFF URL query string 獲取。  |
| `group_name`  | `VARCHAR(255)` | NULLABLE. 群組名稱 (由 Edge Function 調用 LINE API 獲取並填充)。 |
| `picture_url` | `TEXT`         | NULLABLE. LINE 頭像 URL。                                        |
| `created_at`  | `TIMESTAMPTZ`  | NOT NULL, DEFAULT `CURRENT_TIMESTAMP`.                           |
| `updated_at`  | `TIMESTAMPTZ`  | NOT NULL, DEFAULT `CURRENT_TIMESTAMP`.                           |

### 4. `public.group_members`

記錄用戶與群組的成員關係 (多對多)。

| 欄位名            | 類型           | 約束/描述                                                                              |
| :---------------- | :------------- | :------------------------------------------------------------------------------------- |
| `group_member_id` | `UUID`         | **PK**, DEFAULT `gen_random_uuid()`.                                                   |
| `group_id`        | `VARCHAR(255)` | **NOT NULL, FK** to `public.groups(group_id)` ON DELETE CASCADE.                       |
| `profile_id`      | `UUID`         | **NOT NULL, FK** to `public.profiles(id)` ON DELETE CASCADE. 關聯的使用者 Profile ID。 |
| `joined_at`       | `TIMESTAMPTZ`  | NOT NULL, DEFAULT `CURRENT_TIMESTAMP`.                                                 |
| _Constraint_      |                | `UNIQUE (group_id, profile_id)`                                                        |

### 5. `public.bills`

核心表，記錄每一筆帳單（包括消費帳單和內部轉帳帳單）。

| 欄位名                  | 類型            | 約束/描述                                                                                                 |
| :---------------------- | :-------------- | :-------------------------------------------------------------------------------------------------------- |
| `bill_id`               | `UUID`          | **PK**, DEFAULT `gen_random_uuid()`.                                                                      |
| `bill_name`             | `VARCHAR(255)`  | **NOT NULL**.                                                                                             |
| `total_amount`          | `DECIMAL(10,2)` | **NOT NULL**.                                                                                             |
| `currency`              | `VARCHAR(3)`    | **NOT NULL**, DEFAULT `'TWD'`, CHECK `(char_length(currency) = 3)`.                                       |
| `transaction_datetime`  | `TIMESTAMPTZ`   | **NOT NULL**. 消費或轉帳發生的日期和時間。                                                                |
| `description`           | `TEXT`          | NULLABLE.                                                                                                 |
| `notes`                 | `TEXT`          | NULLABLE.                                                                                                 |
| `split_method`          | `VARCHAR(25)`   | **NOT NULL**, CHECK `split_method` IN ('equally', 'percentage', 'amount', 'shares', 'internal_transfer'). |
| `group_id`              | `VARCHAR(255)`  | **NOT NULL, FK** to `public.groups(group_id)`. 此帳單所屬的群組 ID。                                      |
| `receipt_image_urls`    | `JSONB`         | NULLABLE, DEFAULT `'[]'::jsonb`. 儲存收據圖片的 URL 列表。                                                |
| `created_by_profile_id` | `UUID`          | **NOT NULL, FK** to `public.profiles(id)`. 建立帳單的使用者 `profile_id`。                                |
| `settlement_batch_uuid` | `UUID`          | NULLABLE. 僅用於 `split_method = 'internal_transfer'` 的帳單，關聯同批結算產生的轉帳。                    |
| `created_at`            | `TIMESTAMPTZ`   | NOT NULL, DEFAULT `CURRENT_TIMESTAMP`.                                                                    |
| `updated_at`            | `TIMESTAMPTZ`   | NOT NULL, DEFAULT `CURRENT_TIMESTAMP`.                                                                    |

### 6. `public.bill_payments`

記錄帳單的支付者和支付金額（支持多付款人）。

| 欄位名             | 類型            | 約束/描述                                                                                |
| :----------------- | :-------------- | :--------------------------------------------------------------------------------------- |
| `bill_payment_id`  | `UUID`          | **PK**, DEFAULT `gen_random_uuid()`.                                                     |
| `bill_id`          | `UUID`          | **NOT NULL, FK** to `public.bills(bill_id)` ON DELETE CASCADE.                           |
| `payer_profile_id` | `UUID`          | **NOT NULL, FK** to `public.profiles(id)`. 支付者的 `profile_id`。                       |
| `amount_paid`      | `DECIMAL(10,2)` | **NOT NULL**, CHECK (`amount_paid` > 0).                                                 |
| `paid_datetime`    | `TIMESTAMPTZ`   | **NOT NULL**, DEFAULT `CURRENT_TIMESTAMP`. 支付發生的日期和時間。                        |
| _Constraint_       |                 | (可選) `UNIQUE (bill_id, payer_profile_id)` 如果一個帳單的一個付款人只會有一條付款記錄。 |

### 7. `public.bill_sharers`

記錄帳單中每個分攤者的分攤詳情。

| 欄位名                                | 類型            | 約束/描述                                                                                                                                          |
| :------------------------------------ | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bill_sharer_id`                      | `UUID`          | **PK**, DEFAULT `gen_random_uuid()`.                                                                                                               |
| `bill_id`                             | `UUID`          | **NOT NULL, FK** to `public.bills(bill_id)` ON DELETE CASCADE.                                                                                     |
| `profile_id`                          | `UUID`          | **NOT NULL, FK** to `public.profiles(id)`. 參與分攤的使用者 `profile_id`。                                                                         |
| `share_percentage`                    | `DECIMAL(5,2)`  | NULLABLE, CHECK (`share_percentage` IS NULL OR (`share_percentage` >= 0 AND `share_percentage` <= 100)). 僅當 `bills.split_method` = 'percentage'. |
| `share_amount`                        | `DECIMAL(10,2)` | NULLABLE, CHECK (`share_amount` IS NULL OR `share_amount` >= 0). 僅當 `bills.split_method` = 'amount' 或 'internal_transfer' (收款方).             |
| `share_units`                         | `INTEGER`       | NULLABLE, CHECK (`share_units` IS NULL OR `share_units` > 0). 僅當 `bills.split_method` = 'shares'.                                                |
| `calculated_amount_due_for_this_bill` | `DECIMAL(10,2)` | **NOT NULL, DEFAULT 0**. 此人在該特定帳單中的淨資產變動 (支付 - 應分攤)。正數表示應收回，負數表示應付出。                                          |
| `settlement_batch_uuid`               | `UUID`          | NULLABLE. 用於標記此原始消費帳單的分攤記錄已被哪個結算批次處理。如果為 NULL，則表示未結算。                                                        |
| `created_at`                          | `TIMESTAMPTZ`   | NOT NULL, DEFAULT `CURRENT_TIMESTAMP`.                                                                                                             |
| `updated_at`                          | `TIMESTAMPTZ`   | NOT NULL, DEFAULT `CURRENT_TIMESTAMP`.                                                                                                             |
| _Constraint_                          |                 | `UNIQUE (bill_id, profile_id)`                                                                                                                     |

## 關係圖 (概念性)

```mermaid
erDiagram
   users ||--o{profiles : "has one"
   profiles ||--o{group_members : "participates in"
   groups ||--o{group_members : "has"
   profiles ||--o{bills : "created by"
   groups ||--o{bills : "belongs to"
   bills ||--o{bill_payments : "has payments from"
   profiles ||--o{bill_payments : "paid by"
   bills ||--o{bill_sharers : "is shared by"
   profiles ||--o{bill_sharers : "shares"

   profiles {
        UUID id PK "FK to users.id"
        VARCHAR line_user_id "UNIQUE, NOT NULL"
        VARCHAR display_name "NOT NULL"
        TEXT picture_url
        TEXT status_message
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

   groups {
        VARCHAR group_id PK
        VARCHAR group_name
        UUID created_by_profile_id "FK toprofiles.id"
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

   group_members {
        UUID group_member_id PK
        VARCHAR group_id "FK togroups.group_id"
        UUID profile_id "FK toprofiles.id"
        TIMESTAMPTZ joined_at
        -- UNIQUE (group_id, profile_id)
    }

   bills {
        UUID bill_id PK
        VARCHAR bill_name "NOT NULL"
        DECIMAL total_amount "NOT NULL"
        VARCHAR currency "NOT NULL, DEFAULT 'TWD'"
        TIMESTAMPTZ transaction_datetime "NOT NULL"
        VARCHAR split_method "NOT NULL"
        VARCHAR group_id "NOT NULL, FK togroups.group_id"
        UUID created_by_profile_id "NOT NULL, FK toprofiles.id"
        UUID settlement_batch_uuid "NULLABLE, for internal_transfer"
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

   bill_payments {
        UUID bill_payment_id PK
        UUID bill_id "FK tobills.bill_id"
        UUID payer_profile_id "FK toprofiles.id"
        DECIMAL amount_paid "NOT NULL"
        TIMESTAMPTZ paid_datetime "NOT NULL"
    }

   bill_sharers {
        UUID bill_sharer_id PK
        UUID bill_id "FK tobills.bill_id"
        UUID profile_id "FK toprofiles.id"
        DECIMAL share_percentage "NULLABLE"
        DECIMAL share_amount "NULLABLE"
        INTEGER share_units "NULLABLE"
        DECIMAL calculated_amount_due_for_this_bill "NOT NULL, DEFAULT 0"
        UUID settlement_batch_uuid "NULLABLE, marks if settled"
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        -- UNIQUE (bill_id, profile_id)
    }
```

_注意：Mermaid ERD 對於完整約束和細節的表達有限，僅為概念性展示。_

## 重要注意事項和建議

- **自動更新 `updated_at`：** 為所有包含 `updated_at` 欄位的表創建觸發器，以在行更新時自動更新此時間戳。
- **索引：** 為所有外鍵和經常查詢的欄位（如 `transaction_datetime`, `settlement_batch_uuid`）創建索引以優化查詢性能。
- **RLS (Row Level Security)：** 必須為 `public` schema 下的所有表配置適當的 RLS 策略，以確保數據安全和用戶只能訪問其有權限的數據。
- **CHECK 約束的實現：** 一些複雜的 CHECK 約束（例如 `bill_sharers` 中根據 `split_method` 確保只有一個 `share_` 欄位有值）可能更適合在應用層或通過資料庫觸發器來強制執行，因為 SQL 的 `CHECK` 約束能力有限。
- **資料庫函數/觸發器：** 考慮使用資料庫函數和觸發器來自動計算 `bill_sharers.calculated_amount_due_for_this_bill`，以確保數據一致性。
