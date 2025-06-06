-- Supabase Migration Script for SplitEase App

-- 0. Create a helper function to update 'updated_at' columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Function to automatically update the updated_at timestamp on row modification.';

--------------------------------------------------------------------------------
-- Table: public.profiles
-- Stores user profile information, linked to auth.users and LINE profile data.
--------------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    line_user_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    picture_url TEXT NULL,
    status_message TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.profiles IS 'Stores public-facing user profile information, extending auth.users for app-specific data, especially from LINE LIFF.';
COMMENT ON COLUMN public.profiles.id IS 'References the internal Supabase auth user ID.';
COMMENT ON COLUMN public.profiles.line_user_id IS 'Original LINE User ID (string). Must be unique.';
COMMENT ON COLUMN public.profiles.display_name IS 'User''s display name, typically from LINE.';
COMMENT ON COLUMN public.profiles.picture_url IS 'URL of the user''s profile picture, typically from LINE.';
COMMENT ON COLUMN public.profiles.status_message IS 'User''s status message from LINE.';

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Remember to CREATE POLICY statements for this table.

-- Trigger for updated_at
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index on line_user_id is automatically created due to UNIQUE constraint.

--------------------------------------------------------------------------------
-- Table: public.groups
-- Stores information about LINE groups.
--------------------------------------------------------------------------------
CREATE TABLE public.groups (
    group_id VARCHAR(255) PRIMARY KEY,
    group_name VARCHAR(255) NULL,
    picture_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.groups IS 'Stores information about LINE groups relevant to the application.';
COMMENT ON COLUMN public.groups.group_id IS 'LINE Group ID (string), obtained from LIFF URL query string.';
COMMENT ON COLUMN public.groups.group_name IS 'Name of the LINE group, potentially fetched via LINE API by an Edge Function.';
COMMENT ON COLUMN public.groups.picture_url IS 'URL of the group''s picture, potentially fetched via LINE API.';

-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
-- Remember to CREATE POLICY statements for this table.

-- Trigger for updated_at
CREATE TRIGGER set_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

--------------------------------------------------------------------------------
-- Table: public.group_members
-- Junction table for the many-to-many relationship between profiles and groups.
--------------------------------------------------------------------------------
CREATE TABLE public.group_members (
    group_member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id VARCHAR(255) NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_group_member UNIQUE (group_id, profile_id)
);

COMMENT ON TABLE public.group_members IS 'Associates users (profiles) with groups.';
COMMENT ON COLUMN public.group_members.group_id IS 'Foreign key to the groups table.';
COMMENT ON COLUMN public.group_members.profile_id IS 'Foreign key to the profiles table.';
COMMENT ON COLUMN public.group_members.joined_at IS 'Timestamp when the user was associated with the group in this app.';

-- Enable Row Level Security
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
-- Remember to CREATE POLICY statements for this table.

-- Indexes are automatically created for foreign keys by Supabase/Postgres in many cases,
-- and unique_group_member constraint also creates an index.
-- Explicitly:
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_profile_id ON public.group_members(profile_id);


--------------------------------------------------------------------------------
-- Table: public.bills
-- Core table for storing bill information, including expenses and internal transfers.
--------------------------------------------------------------------------------
CREATE TABLE public.bills (
    bill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'TWD' CHECK (char_length(currency) = 3),
    transaction_datetime TIMESTAMPTZ NOT NULL,
    description TEXT NULL,
    notes TEXT NULL,
    split_method VARCHAR(25) NOT NULL CHECK (split_method IN ('equally', 'percentage', 'amount', 'shares', 'internal_transfer')),
    group_id VARCHAR(255) NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
    receipt_image_urls JSONB NULL DEFAULT '[]'::jsonb,
    created_by_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT, -- RESTRICT to prevent deleting a profile if they created bills. Consider SET NULL or CASCADE based on your deletion strategy.
    settlement_batch_uuid UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.bills IS 'Stores all bills, including expenses and internal settlement transfers.';
COMMENT ON COLUMN public.bills.transaction_datetime IS 'Date and time the transaction actually occurred.';
COMMENT ON COLUMN public.bills.split_method IS 'Method used to split the bill among sharers. ''internal_transfer'' is for settlement-generated bills.';
COMMENT ON COLUMN public.bills.group_id IS 'The group this bill belongs to. All bills are group-specific.';
COMMENT ON COLUMN public.bills.created_by_profile_id IS 'Profile ID of the user who created this bill.';
COMMENT ON COLUMN public.bills.settlement_batch_uuid IS 'For ''internal_transfer'' bills, links them to a specific settlement operation batch.';

-- Enable Row Level Security
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
-- Remember to CREATE POLICY statements for this table.

-- Trigger for updated_at
CREATE TRIGGER set_bills_updated_at
BEFORE UPDATE ON public.bills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bills_group_id ON public.bills(group_id);
CREATE INDEX IF NOT EXISTS idx_bills_created_by_profile_id ON public.bills(created_by_profile_id);
CREATE INDEX IF NOT EXISTS idx_bills_transaction_datetime ON public.bills(transaction_datetime);
CREATE INDEX IF NOT EXISTS idx_bills_settlement_batch_uuid ON public.bills(settlement_batch_uuid) WHERE settlement_batch_uuid IS NOT NULL;


--------------------------------------------------------------------------------
-- Table: public.bill_payments
-- Records who paid how much for a specific bill (supports multiple payers).
--------------------------------------------------------------------------------
CREATE TABLE public.bill_payments (
    bill_payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES public.bills(bill_id) ON DELETE CASCADE,
    payer_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT, -- RESTRICT: don't delete profile if they made payments.
    amount_paid DECIMAL(10, 2) NOT NULL CHECK (amount_paid > 0),
    paid_datetime TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    -- Add a UNIQUE constraint if one user can only make one payment record per bill
    -- CONSTRAINT unique_bill_payer_payment UNIQUE (bill_id, payer_profile_id)
);

COMMENT ON TABLE public.bill_payments IS 'Tracks payments made by users for specific bills.';
COMMENT ON COLUMN public.bill_payments.payer_profile_id IS 'Profile ID of the user who made this payment.';
COMMENT ON COLUMN public.bill_payments.amount_paid IS 'Amount paid by this user for this bill.';
COMMENT ON COLUMN public.bill_payments.paid_datetime IS 'Date and time the payment was made or recorded.';

-- Enable Row Level Security
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
-- Remember to CREATE POLICY statements for this table.

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bill_payments_bill_id ON public.bill_payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_payments_payer_profile_id ON public.bill_payments(payer_profile_id);

--------------------------------------------------------------------------------
-- Table: public.bill_sharers
-- Details how a bill is shared among different users.
--------------------------------------------------------------------------------
CREATE TABLE public.bill_sharers (
    bill_sharer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES public.bills(bill_id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT, -- RESTRICT: don't delete profile if they are part of a bill share.
    share_percentage DECIMAL(5, 2) NULL CHECK (share_percentage IS NULL OR (share_percentage >= 0 AND share_percentage <= 100)),
    share_amount DECIMAL(10, 2) NULL CHECK (share_amount IS NULL OR share_amount >= 0),
    share_units INTEGER NULL CHECK (share_units IS NULL OR share_units > 0),
    calculated_amount_due_for_this_bill DECIMAL(10,2) NOT NULL DEFAULT 0,
    settlement_batch_uuid UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_bill_sharer UNIQUE (bill_id, profile_id)
);

COMMENT ON TABLE public.bill_sharers IS 'Defines how each user shares a specific bill and their net due amount for it.';
COMMENT ON COLUMN public.bill_sharers.profile_id IS 'Profile ID of the user sharing this part of the bill.';
COMMENT ON COLUMN public.bill_sharers.share_percentage IS 'Percentage share, used if bills.split_method is ''percentage''.';
COMMENT ON COLUMN public.bill_sharers.share_amount IS 'Fixed amount share, used if bills.split_method is ''amount'' or for receiver in ''internal_transfer''.';
COMMENT ON COLUMN public.bill_sharers.share_units IS 'Share units, used if bills.split_method is ''shares''.';
COMMENT ON COLUMN public.bill_sharers.calculated_amount_due_for_this_bill IS 'Net amount this user owes (negative) or is owed (positive) FOR THIS SPECIFIC BILL, after considering their own payments for it.';
COMMENT ON COLUMN public.bill_sharers.settlement_batch_uuid IS 'If this bill share was part of an original expense bill, this links to the settlement batch that cleared it. If NULL, it''s unsettled. For ''internal_transfer'' sharers (receivers), this can also be set.';

-- Enable Row Level Security
ALTER TABLE public.bill_sharers ENABLE ROW LEVEL SECURITY;
-- Remember to CREATE POLICY statements for this table.

-- Trigger for updated_at
CREATE TRIGGER set_bill_sharers_updated_at
BEFORE UPDATE ON public.bill_sharers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bill_sharers_bill_id ON public.bill_sharers(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_sharers_profile_id ON public.bill_sharers(profile_id);
CREATE INDEX IF NOT EXISTS idx_bill_sharers_settlement_batch_uuid ON public.bill_sharers(settlement_batch_uuid) WHERE settlement_batch_uuid IS NOT NULL;


-- Final reminders:
-- 1. Review all ON DELETE actions (CASCADE, RESTRICT, SET NULL) for foreign keys to ensure they match your desired data integrity rules.
--    For example, if a user profile is deleted, what should happen to bills they created or payments they made?
--    Current setup:
--        - Deleting auth.users cascades to profiles.
--        - Deleting profiles cascades to group_members.
--        - Deleting groups cascades to group_members and bills.
--        - Deleting bills cascades to bill_payments and bill_sharers.
--        - created_by_profile_id in groups is SET NULL if profile deleted.
--        - created_by_profile_id, payer_profile_id, profile_id in bills/payments/sharers are RESTRICT by default (unless changed). I've set them to RESTRICT here, meaning you can't delete a profile if it's referenced.
-- 2. Implement detailed RLS policies for each table.
-- 3. Implement application-level logic or database functions/triggers for complex checks (e.g., sum of shares equaling total amount, calculating `calculated_amount_due_for_this_bill`).