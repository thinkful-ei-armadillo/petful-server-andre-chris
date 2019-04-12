'use strict'; 

const Queue = require('./queue'); 
const data = require('./store.json'); 

const express = require('express');
const cors = require('cors');
const jsonParser = express.json(); 

const { PORT } = require('./config'); 

const app = express();
app.use(cors());

function createQueue(type){
  let animals = new Queue(); 
  let list = data[type]; 
  list.forEach(animal => {
    animals.enqueue(animal);  
  });
  return animals; 
}

let dogsQueue = createQueue('dogs'); 
let catsQueue = createQueue('cats');
let usersQueue = createQueue('users');  


function display(s){
  if(!s.first){
    return null;
  }
  let currNode = s.first;
  let sArr = [];
  while(currNode !== null){
    sArr.push(currNode.value);
    currNode = currNode.next;
  }
  return sArr;
}

let catTimer;
let dogTimer; 

function startCatInterval(){
  catTimer = setInterval(() => {
    if( catsQueue.first !== null) {
      if(catsQueue.first.value.adopted !== ''){
        catsQueue.dequeue();
      } 
    }
    else {
      clearInterval(catTimer);
    } 
  }, 5000); 
}

function startDogInterval() { 
  dogTimer = setInterval(() => {
    if(dogsQueue.first !== null) {
      if(dogsQueue.first.value.adopted !== ''){
        dogsQueue.dequeue(); 
      }
    } 
    else {
      clearInterval(dogTimer);
    } 
  }, 5000); 
}


app.route('/api/cats')
  .get((req, res, next) => {
    startCatInterval(); 
    res.status(200).json(display(catsQueue)); 
  });

app.route('/api/dogs')
  .get((req, res, next) => {
    startDogInterval(); 
    res.status(200).json(display(dogsQueue)); 
  }); 

app.route('/api/users')
  .get((req, res, next) =>{
    res.status(200).json(display(usersQueue)); 
  }); 

app.route('/api/cats/:name')
  .patch(jsonParser, (req, res, next) => {
    const { adopted } = req.body;
    catsQueue.first.value.adopted = adopted;
    res.status(204).end();  
  }); 

app.route('/api/dogs/:name')
  .patch(jsonParser, (req, res, next) => {
    const { adopted } = req.body; 
    dogsQueue.first.value.adopted = adopted;
    
    res.status(204).end();  
  });


// Catch-all 404
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch-all Error handler
// Add NODE_ENV check to prevent stacktrace leak
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

app.listen(PORT,()=>{
  console.log('Serving on 8080');
});