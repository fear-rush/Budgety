var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1 // deafult percentagenya -1 (jika nilainya 0% atau error maka akan menampilkan -1)
  };


  // object Expense diberi prototype karena agar bisa diakses tiap object expense
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = 0;
    }
  };

  // object Expense diberti getter prototype --> menggunakan konsep setter dan getter
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },

    totals: {
      exp: 0,
      inc: 0
    },

    budget: 0,
    percentage: -1 // -1 jika hasilnya infinity karena persenan dari expenses adalah expenses/income * 100 
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      ID = 0;
      
      // ID = last ID + 1
      if (data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length-1].id + 1;
        console.log(ID);
      } else {
        ID = 0;
      }
     
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      // map akan mereturn suatu array yang baru. jadi pada baris ini nanti map nya akan return array current.item dari setiap objek inc atau exp
      ids = data.allItems[type].map(function(current) {
        return current.id
      });
      

      // lalu pada array di ids akan dicari indexnya, misal
      // iterasi-1
      /**** 
       * ids = [1 2 3 4] --> asumsikan id tidak urut karena sudah ada beberapa item yang di delete
       * inc-1 = 200, inc-2 = 400, inc-3 = 500, inc-4 = 600
       * lalu panggil fungsi --> deleteItem(inc, 3)
       * index = ids.indexOf(3)
       * index = 2
       * delete ids pada index ke 2
       * ids = [1 2 4 ] --> id 3 di delete
       * 
       *
      */

      index = ids.indexOf(id);
      if (index !== -1) {
        // splice = remove element dari array mulai dari index dan jumlahnya 1
        data.allItems[type].splice(index,1)
      }

    },



    calculateBudget: function() {

      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');


      // Calculate the budget: income-expenses
      data.budget = data.totals.inc - data.totals.exp;


      // calculate the percentage of income that we spent

      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1; // -1 jika hasilnya infinity karena persenan dari expenses adalah expenses/income * 100 
      }


    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });

    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });

      return allPerc;

    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }

  };


})();




var UIController = (function() {

  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber= function(num, type) {
    var numSplit, int, dec, type;

    num = Math.abs(num);
    num = num.toFixed(2);

    // untuk memisahkan angka dengan desimal di split
    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      // substr = membagi string sesuai start dan endpoint
      int = int.substr(0, int.length -3) + ',' + int.substr(int.length - 3, 3) 
    }

    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;  
  };

   // fungsi callback, maka fungsi yang memanggil nodeListForEach akan dipassing ke parameter callback dan fields akan dipassing ke parameter list
   var nodeListForEach = function(list, callback) {
    for(var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };


  
    return {
      getInput: function() {
        return {
          type: document.querySelector(DOMStrings.inputType).value,
          description: document.querySelector(DOMStrings.inputDescription).value,
          value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
        }
      },

      addListItem: function(obj,type) {
          
       if (type === "inc") {
        element = DOMStrings.incomeContainer;

         html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
       } else if(type === "exp") {
        element = DOMStrings.expensesContainer;

        html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
       }

       // Replace html placeholder

       newHtml = html.replace('%id%', obj.id);
       newHtml = newHtml.replace('%description%', obj.description);
       newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

       // Insert html to DOM
       document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        
      },

      clearFields: function() {
        var fields, fieldsArr;
  
        // querySelectorAll return list, jadi harus diconvert jadi array make splice terus call prototype dari object Array
        // splice = mengcopy array
        fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

        fieldsArr = Array.prototype.slice.call(fields);

        fieldsArr.forEach(function(current){
          current.value = "";
        });
        
        fieldsArr[0].focus();
      }, 

      deleteListItem: function(selectorID) {

        var el = document.getElementById(selectorID);
        // Harus menuju ke parent dulu lalu remove childnya, soalnya kalo langsung remove target maka nanti error
        // versi panjangnya --> document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID))
        el.parentNode.removeChild(el);

      },

      displayBudget: function(obj) {

        var type;
        obj.budget > 0 ? type = 'inc' : type = 'exp';

        document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
        // document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage;

        if(obj.percentage > 0) {
          document.querySelector(DOMStrings.percentageLabel).textContent = `${obj.percentage}%`
        } else {
          document.querySelector(DOMStrings.percentageLabel).textContent = '---';
        }


      },

      displayPercentages: function(percentages) {

        // NodeList merupakan tupe data yang didapat dari extracted document node-node di html
        // jika mereturn value dari html menggunakan DOM, contohnya dengan querySelector atau querySelectorAll akan mereturn value NodeList
        // maka dari itu pada fungsi ini dibuat fungsi nodeListForEach untuk membuat forEach pada NodeList karena pada NodeList tidak menginherit atau mempunyai prototype forEach, tidak sama seperti array yang ada prototype forEach

        var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

        // fields = [div.item__percentage, div.item__percentage, ... dst]
        // console.log('fields = ', fields);

        nodeListForEach(fields, function(current, index) {

          if(percentages[index] > 0) {
            current.textContent = percentages[index] + '%';
          } else {
            current.textContent = '---';
          }

        });

      },

      displayMonth: function() {
          var now, year, month;

          now = new Date();

          year = now.getFullYear();
          month = now.toLocaleString('deafult', {month: 'long'});
          document.querySelector(DOMStrings.dateLabel).textContent = month + ' ' +  year;
      },

      changedType: function() {

        // var fields = document.querySelectorAll(
        //   `${DOMStrings.inputType, 
        //     DOMStrings.inputDescription, 
        //     DOMStrings.inputValue}`
        //     );

        var fields = document.querySelectorAll(
          DOMStrings.inputType + ',' +
          DOMStrings.inputDescription + ',' +
          DOMStrings.inputValue
        );

        nodeListForEach(fields, function(cur) {
          cur.classList.toggle('red-focus');
        });

        document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        
        

      },


      getDOMstrings: function() {
        return DOMStrings;
      }
    };




})();




var controller = (function(budgetCtrl, UICtrl) {


  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event) {
      if(event.key === 'Enter') {
        ctrlAddItem();
      }
    });

    // implementasi event bubbling di class container agar dapat meng-catch trigger dari button delete pada list income dan expenses karena daripada mengimplementasi pada tiap list income dan expenses akan repetititf maka diaplikasikan event bubbling
    // use case event bubbling :
    // 1. pada element yang memiliki banyak child dan setiap child butuh event trigger
    // 2. pada element yang memiliki id/class tetapi belum muncul pada DOM (masih di display none atau hidden)
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)

  }


  // updateBudget dibuat fungsi sendiri karena agar bisa reusabe digunakan di ctrlAddItem sama ctrlDeleteItem
  var updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. return the budget
    var budget = budgetCtrl.getBudget();

    // 5. display the budget on the UI
    UICtrl.displayBudget(budget);
  }

  // updatePercentages dibuat fungsi sendiri karena agar bisa reusabe digunakan di ctrlAddItem sama ctrlDeleteItem
  var updatePercentages = function() {

    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);


  }




    var ctrlAddItem = function() {

      var input, newItem;
    
     // 1. Get the field input data
       input = UICtrl.getInput(); 
       
       
       if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
         
             // 2. Add the item to the budget controller
               newItem = budgetCtrl.addItem(input.type, input.description, input.value);
         
             // 3. Add the item to the UI
               UICtrl.addListItem(newItem, input.type);
         
             // 4. Clear the fields
               UICtrl.clearFields();
         
             // 5. Calculate and update budget
              updateBudget();

              // 6. Calculate and update percentages
              updatePercentages();


       }
    
     }
    
    var ctrlDeleteItem = function(event) {
      var itemID, type, ID;

      // mennggunakan event bubbling pada tag <i> delete button pada html agar tiap delete button dapat mendelete satu row dari income/expense dengan id tertentu
      // targetnya adalah income-id dan expenses-id
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

      // menggunakan if else pada ID untuk mengecek apakah item yang akan didelete benar benar ada karena pada element html hanya ada 2 element id yaitu income-id dan expenses-id
      if(itemID) {
        splitID = itemID.split('-'); // misal income-2 maka splitID = [income, 2] ---> memisah string
        type = splitID[0];
        ID = parseInt(splitID[1]);

      // 1. delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();

      // 4. Calculate and update percentages
      updatePercentages();


      }

     

    } 



     return {
       init: function() {
         console.log("Application has started");
         UICtrl.displayMonth();
         // inisialisasi ui dengan semuanya 0 (reset dari awal)
         UICtrl.displayBudget({
          budget: 0,
          totalInc: 0,
          totalExp: 0,
          percentage: -1
         });
         setupEventListeners();
       }
     }



})(budgetController, UIController);

controller.init();