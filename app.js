
// BUDGET CONTROLLER

var budgetController = ( function(){
        var Expense = function(id, description, value){
          this.id = id;
          this.description = description;
          this.value = value;
          this.percentage = -1;
        };

        Expense.prototype.calcPercentage = function(totalIncome){
          if (totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) * 100);
          }  else {
            this.percentage = -1;
          }
        };

        Expense.prototype.getPercentage = function(){
          return this.percentage;
        };

        var Income = function(id, description, value){
          this.id = id;
          this.description = description;
          this.value = value;
        };

        var calculateTotal = function(type){
          var sum = 0;
          data.allItems[type].forEach(function(cur){
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
          percentage: -1
        };

        return {
          addItem: function(type, des, val){
            var newItem,ID;

            // [1 2 3 4 5] => next ID =6
            // [1 2 4 6 8] => next ID =9
            // ID = lastID +1

            // Create New ID
            if (data.allItems[type].length > 0) {
              ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
              ID = 0;
            }

            // Create New Item based on inc or exp type
            if(type === 'exp'){
              newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
               newItem = new Income(ID, des, val);
            }

            // Push the new Element
            data.allItems[type].push(newItem);

            // Return the new Element
            return newItem;
          },

          deleteItem: function(type, id){
            var IDs, index;
            // id = 6
            // data.allItems[type][id] will not gonna work as desired coz
            // if ids = [1 2 4 6 8]
            // index = 3

            IDs = data.allItems[type].map(function(current){
              return current.id;
            });

            index = IDs.indexOf(id);

            if (index !== -1) {
              data.allItems[type].splice(index, 1);
            }

          },

          calculateBudget: function(){
            // Calculate the total income and expenses__list
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate budget: income - expneses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the % of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

          },

          calculatePercentages: function(){
            /*
            a = 20
            b = 10
            c = 40
            income = 100
            %a => 20%
            %b => 10%
            %c => 40%
            */
            data.allItems.exp.forEach(function(current){
              current.calcPercentage(data.totals.inc);
            });

          },

          getPercentages: function(){
            var allPercentages = data.allItems.exp.map(function(current) {
              return current.getPercentage();
            });
            return allPercentages;
          },

          getBudget: function(){
            return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
            };
          },
          testing: function(){
              console.log(data);

              }


        };

})();

// UI CONTROLLER
var UIController = ( function(){
        var DOMstrings = {
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
            itemPercentage: '.item__percentage',
            dateLabel: '.budget__title--month'
          };

        var  formatNumber =  function(num, type){
            var numSplit, int, dec, type;
            /*    RULES:
            + or - before the number
            exactly 2 decimal points
            comma seperating the thousands

            2310.4567 -> 2,310.46
            2000 --> 2,000.00
            */
            num = Math.abs(num);
            num = num.toFixed(2);

            numSplit = num.split('.');

            int = numSplit[0];
            for(var i = 0; i<int.length; i++){
              if(int.length - 3 > 3){
                int
              }
            }
            if (int.length > 3) {
              int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);    // 23510 -> 23,510
            }

            dec = numSplit[1];

            return (type === 'exp' ? '-':'+') + ' ' + int + '.' + dec;

          };

          var nodeListForEach = function(list, callback){
            for (var i = 0; i < list.length; i++){
              callback(list[i], i);
            }
          };



      return {
        getInput: function(){
          return {
            type: document.querySelector(DOMstrings.inputType).value,     // Will be either inc or exp
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)  /// parseFloat will convert this string into floating numbers
          };
        },
        addListItem: function(obj, type){
          var html, newHtml, element;
          // Create HTML string with placeholder text
          if (type === 'inc') {
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
          } else if (type === 'exp') {
            element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
          }


          // Replace placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

          //  Insert the HTML into the DOM
          document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);



        },
        deleteListItem: function(selectorID){
          var el = document.getElementById(selectorID);
          el.parentNode.removeChild(el);
        },
        clearFields: function(){
          var fields, fieldsArr;
          fields = document.querySelectorAll(DOMstrings.inputDescription +', '+ DOMstrings.inputValue);   //this will return a list not an array
          fieldsArr = Array.prototype.slice.call(fields);    // method to convert list into an array

          // forEach loop
          fieldsArr.forEach(function (current, index, array){
            current.value = "";
          });
          fieldsArr[0].focus();     // to set the focus again to description input field
        },
        displayBudget: function(obj){
          var type;

          obj.budget>0 ? type = 'inc' : type = 'exp';
          document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
          document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
          document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

          if (obj.percentage >0 ) {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
          } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = '---';
          }

        },
        displayPercentages: function(percentages){

            var fields;
            fields = document.querySelectorAll(DOMstrings.itemPercentage);



            nodeListForEach(fields, function(current, index){
              if (percentages[index] > 0) {
                current.textContent = percentages[index] + '%';
              } else {
                current.textContent = '---';
              }
            });
        },

        displayMonth: function(){
          var now, year, months, months;
          now = new Date();
          // year christmas = new Date(2017, 12, 25);
          months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

          year = now.getFullYear();
          month = now.getMonth();
          document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+year;


        },

        changedType: function(){
          var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

          nodeListForEach(fields, function(cur){
            cur.classList.toggle('red-focus');
          });

          document.querySelector(DOMstrings.inputBtn).classList.toggle('red');


        },

        getDOMstrings: function(){
          return DOMstrings;
        }
      };


})();

// GLOBAL APP CONTROLLER
var controller = ( function (budgetCtrl, UICtrl){

    var setupEventListeners = function(){
      var DOM = UICtrl.getDOMstrings();
      document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        //When Enter is pressed
      document.addEventListener('keypress', function(event){
        if (event.keyCode === 13 || event.which === 13) {
          ctrlAddItem();
        }
      });

      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
      document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    var updateBudget = function(){
      // 1. Calculate the budget
      budgetCtrl.calculateBudget();

      // 2. Return the budget
      var budget = budgetCtrl.getBudget();

      // 3. Update budget to the UI
      UICtrl.displayBudget(budget);

    }

    var updatePercentages = function(){

      // 1. Calculate Percentages
      budgetCtrl.calculatePercentages();

      // 2. Read Percentages from the budget Co ntroller
      var percentages = percentages = budgetCtrl.getPercentages();

      // 3. Update the UI with the new Percentages
      UICtrl.displayPercentages(percentages);

    }

    var ctrlAddItem = function(){
        var input, newItem;
      // 1. Get the filled input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value>0 ) {    // NaN means Not A Number
          // 2. Add data to the budgetController
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

          // 3. Add the item to UI
            UICtrl.addListItem(newItem, input.type);

          // 4. Clear all the input fields
            UICtrl.clearFields();

          // 5. Update the budget
            updateBudget();

          // 6. Calculate and Update Percentages
            updatePercentages();

        }


    }

    var ctrlDeleteItem = function(event){
      var itemID, splitID, type, ID;
      itemID = event.target.parentNode.parentNode.parentNode.id;


      if (itemID) {
        // inc-1                        var s = 'inc-1' => console.log(s.split('-')) ==> ['inc', '1']
        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);

        // 1. Delete the item from the data Structure
        budgetCtrl.deleteItem(type, ID);
        // 2. Delete the item from the UI
        UICtrl.deleteListItem(itemID);
        // 3. Update and show the new budget in the UI
        updateBudget();

        // 4. Calculate and Update Percentages
        updatePercentages();
      }

    }

    return {
      init: function(){
        console.log('Application has started.');
        setupEventListeners();
        UICtrl.displayMonth();
        UICtrl.displayBudget({
          budget: 0,
          totalInc: 0,
          totalExp: 0,
          percentage: -1
        });

      }
    }



})(budgetController, UIController);


controller.init();
