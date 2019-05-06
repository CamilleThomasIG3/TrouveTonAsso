var app = new Vue({
  el: '#app',
  data: {
    message: "Hello",
    seen: true, //on le voit
    todos: [
      { text: 'text1'},
      { text: 'text2'},
      { text: 'text3'}
    ],
    msg: "Inchangeable",
    rawHtml: "<span style='color:red'>Rouge</span>",
    cart: 0
  },
  methods: {
    reverse: function(){
      this.message = this.message.split('').reverse().join('')
    }
  }
});

app.message = "Message changé";
//app.seen = false;//on le voit plus
app.todos.push({text: 'NewText'});
app.msg = "Change !";

Vue.component('todo-item', {
  props: ['todo'],
  template: '<li>{{ todo.text }}</li>'
});

var app2 = new Vue({
  el: '#app2',
  data: {
    groceryList: [
      { id: 0, text: "Vegetables" },
      { id: 1, text: "Cheese" },
      { id: 2, text: "Other" }
    ],
    image: "logo.jpg"
  }
});


var ap = new Vue({
  el: '#app3',
  data: {
    message : 'Affichage : ' + new Date().toLocaleString()
  }
});
