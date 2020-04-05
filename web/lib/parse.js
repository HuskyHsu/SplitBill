class Parse {
  constructor(bill, option) {
    this.price = bill.price
    this.payer = bill.payer
    this.debtor = bill.debtor
    this.splitType = bill.splitType
    this.unit = option.unit
    this.payRemnant = option.payRemnant
    this.member = {}
    this.remnant = 0

    this.checkPayBalance()
        .createMember()
        .calc()
        .checkBalance();
    
  };

  checkPayBalance() {
    const balance = this.payer.reduce((pre, item) => pre += item.share, 0) === this.price
    if (!balance) {
      throw new Error('pay and price is not mactch')
    }
    return this
  };

  createMember() {
    this.payer.forEach((user) => {
       this.member[user.userId] = {
         pay: user.share,
         share: 0
       }
     })

     this.debtor.forEach((user) => {
       if (!(user.userId in this.member)) {
         this.member[user.userId] = {
          pay: 0,
          share: 0
        }
       }
     })
     return this
  };

  assignRemnant() {
    let remnant = this.remnant;
    const subtract = (remnant) => {
      return (remnant > this.unit) ? this.unit : remnant
    }

    while ( remnant > 0 ) {
      const remainder = subtract(remnant);
      if (this.payRemnant === 'DEBTOR' || this.payRemnant === 'AVG') {
        this.debtor.forEach((user) => {
          if (remnant > 0 && this.member[user.userId].pay === 0) {
            this.member[user.userId].share -= remainder;
            remnant -= remainder;
          }
        })
      }
      if (this.payRemnant === 'PAYER' || this.payRemnant === 'AVG') {
        this.payer.forEach((user) => {
          if (remnant > 0) {
            this.member[user.userId].share -= remainder;
            remnant -= remainder;
          }
        })
      }
    }
    return this
  };

  checkBalance() {
    let zero = 0;
    Object.keys(this.member).forEach((key) => {
      zero += this.member[key].share + this.member[key].pay;
    })
    if (zero !== 0) {
      throw new Error('calc not balance');
    }
  };

  calc() {
    let methods = {
      'AVG': this.calcAvg,
      'EXTRA': this.calcExtra,
      'PERCENT': this.calcPercent,
      'WEIGHTS': this.calcWeights,
      'SINGLE': this.calcSingle
    };

    if (this.splitType in methods) {
      methods[this.splitType].call(this)
          .assignRemnant()
    } else {
      throw new Error(`not find calc method of ${this.splitType}`);
    }

    return this
  };

  calcAvg() {
    const sharePrice = Math.floor(this.price / this.debtor.length / this.unit) * this.unit;
    let remnant = this.price - sharePrice * this.debtor.length;

    this.debtor.forEach((user) => {
      this.member[user.userId].share -= sharePrice;
    })

    this.remnant = remnant
    return this
  };

  calcExtra() {
    let remnant = this.price;
    this.debtor.forEach((user) => {
      this.member[user.userId].share -= user.extra || 0;
      remnant -= user.extra || 0;
    })
    const sharePrice = Math.floor(remnant / this.debtor.length / this.unit) * this.unit;
    this.debtor.forEach((user) => {
      this.member[user.userId].share -= sharePrice;
      remnant -= sharePrice;
    })

    this.remnant = remnant
    return this
  };

  calcPercent() {
    let remnant = this.price;
    this.debtor.forEach((user) => {
      const sharePrice = Math.floor(this.price * user.percent / 100 / this.unit) * this.unit;
      this.member[user.userId].share -= sharePrice;
      remnant -= sharePrice;
    })

    this.remnant = remnant
    return this
  };

  calcWeights() {
    let remnant = this.price;
    const weights = this.debtor.reduce((pre, user) => {return pre + user.weight}, 0);
    this.debtor.forEach((user) => {
      const sharePrice = Math.floor(this.price * user.weight / weights / this.unit) * this.unit;
      this.member[user.userId].share -= sharePrice;
      remnant -= sharePrice;
    })

    this.remnant = remnant
    return this
  };

  calcSingle() {
    let remnant = this.price;
    this.debtor.forEach((user) => {;
      this.member[user.userId].share -= user.share;
      remnant -= user.share;
    })

    this.remnant = remnant
    return this
  };

  result() {
    console.log(this.splitType);
    console.log(this.member);
    console.log('----------');
  };

  static flowBalance(bills) {
    let member = {};
    bills.forEach((bill) => {
      Object.keys(bill.member).forEach((userId) => {
        const user = bill.member[userId];
        if (userId in member) {
          member[userId].pay += user.pay;
          member[userId].share += user.share;
        } else {
          member[userId] = {
            pay: user.pay,
            share: user.share
          };
        }
      })
    })
    let zero = 0;
    Object.keys(member).forEach((userId) => {
      const user = member[userId];
      zero += user.pay + user.share
      user.result = user.pay + user.share;
    });

    if (zero !== 0) {
      throw new Error('result not balance')
    }
    
    return member
  };

  static payToWho(member) {
    // 應付帳款 AP = Account Payable
    // 應收帳款 AR = Account Receivable
    let debtor = [];
    let payer = [];
    // let receMap = {}
    Object.keys(member).forEach((userId) => {
      const user = member[userId];
      if (user.result > 0) {
        payer.push({userId: userId, AR: user.result, from: []});
      } else if (user.result < 0) {
        debtor.push({userId: userId, to: [], AP: user.result, remnant: -user.result});
        // if (-user.result in receMap) {
        //   receMap[-user.result].push[userId];
        // } else {
        //   receMap[-user.result] = [userId];
        // }
      }
    })

    debtor.sort(function (a, b) {
      return b.AP - a.AP
    });
    payer.sort(function (a, b) {
      return a.AR - b.AR
    });

    // console.log(receMap);
    // payer.forEach((user) => {
    //   if (user.AR in receMap) {
    //     const userId = receMap[user.AR].pop();
    //     user.AP.push({userId: userId, AR: user.AR})
    //     if (receMap[user.AR].length === 0) {
    //       delete receMap[user.AR]; 
    //     }
    //   }
    // });

    payer.forEach((p) => {
      let AR = p.AR;
      debtor.forEach((d) => {
        if (AR <= 0 || d.remnant <= 0) {
          return
        }
        const AP = d.remnant > AR ? AR : d.remnant;
        d.remnant -= AP;
        AR -= AP;
        p.from.push({
          userId: d.userId,
          AP: AP
        })
        d.to.push({
          userId: p.userId,
          AR: AP
        })
      })
    })

    console.log('\n--result--');
    console.log(member);
    console.log('payer');
    payer.forEach((user) => {
      console.log(user);
    })
    console.log('debtor');
    debtor.forEach((user) => {
      console.log(user);
    })
  };
};
  
module.exports = Parse