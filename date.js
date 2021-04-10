
//console.log(module);
// exports refers to module.exports

exports.getDate  = function(){
  const today = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  }

  return today.toLocaleString('tr-TR', options);
}


exports.getDay = function(){
  const today = new Date();
  const options = {
    day: "numeric",
  }

  return today.toLocaleString('tr-TR', options);
}

//console.log(module.exports);
