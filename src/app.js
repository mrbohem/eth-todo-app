var App = {
     loading:false,
     contract:{},
     load: async () => {
          await App.loadWeb3()
          await App.loadAccount()
          await App.loadContract()
          await App.render()
          await App.renderTask()
     },
     loadWeb3: async () => {
          if (typeof web3 !== 'undefined') {
               App.web3Provider = web3.currentProvider
               web3 = new Web3(web3.currentProvider)
          } else {
               window.alert("Please connect to Metamask.")
          }
          // Modern dapp browsers...
          if (window.ethereum) {
               window.web3 = new Web3(ethereum)
               try {
                    // Request account access if needed
                    await ethereum.enable()
                    // Acccounts now exposed
                    web3.eth.sendTransaction({/* ... */ })
               } catch (error) {
                    // User denied account access...
               }
          }
          // Legacy dapp browsers...
          else if (window.web3) {
               App.web3Provider = web3.currentProvider
               window.web3 = new Web3(web3.currentProvider)
               // Acccounts always exposed
               web3.eth.sendTransaction({/* ... */ })
          }
          // Non-dapp browsers...
          else {
               console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
          }
     },
     loadAccount: async () => {
          App.account = await web3.eth.getAccounts().then((account) => account[0]);
     },
     loadContract: async () => {
          const todoList = await $.getJSON('TodoList.json');
          App.contract.TodoList = TruffleContract(todoList);
          App.contract.TodoList.setProvider(App.web3Provider);
          App.todoList = await App.contract.TodoList.deployed()
     },
     render: async () => {
          if (App.loading) {
               return
          }
          App.setLoading(true)
          $('#account').html(App.account)
          App.setLoading(false);
     },
     renderTask: async () => {
          const taskCount = await App.todoList.taskCount()
          const taskTemplate = document.getElementsByClassName('taskTemplate')[0];
          for (let i = 1; i <= taskCount; i++) {
               const task = await App.todoList.tasks(i);
               taskId = task[0].toNumber()
               taskContent = task[1]
               taskCompleted = task[2]
               newTaskTemplate = taskTemplate.cloneNode(true);
               newTaskTemplate.getElementsByClassName('content')[0].textContent = taskContent;
               newTaskTemplate.getElementsByClassName('task_completed_checkbox')[0].setAttribute('onClick', `App.toggleCompleted(${taskId})`);
               if (taskCompleted)
                    document.getElementById("completedTaskList").appendChild(newTaskTemplate)
               else
                    document.getElementById("taskList").appendChild(newTaskTemplate)
                    
          }
          taskTemplate.remove();
     },
     toggleCompleted: async(taskId) => { 
          App.setLoading(true)
          await App.todoList.toggleCompleted(taskId,{from:App.account})
          window.location.reload()
     },
     createTask: async () => {
          App.setLoading(true);
          const content = document.getElementById('newTask').value;
          await App.todoList.createTask(content,{from:App.account});
          window.location.reload();
     },
     setLoading: (boolean) => {
          App.loading = boolean
          const loader = $('#loader')
          const content = $('#content')
          if (boolean) {
               loader.show()
               content.hide()
          } else {
               loader.hide()
               content.show()
          }
     }
}

App.load();