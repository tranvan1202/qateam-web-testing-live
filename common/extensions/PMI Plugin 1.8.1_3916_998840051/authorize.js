let delay

console.log('authorize.js has been launched');

window.addEventListener("load", function load(event){
  window.removeEventListener("load", load, false); //remove listener, no longer needed
  delay = setInterval(function() {
    let inputField = document.getElementsByTagName("input")[0];
    console.log(window.getComputedStyle(inputField,':-internal-autofill-selected')['appearance']);
    if (window.getComputedStyle(inputField,':-internal-autofill-selected')['appearance'] == 'menulist-button') {
      inputField.classList.add('valid');
      clearInterval(delay)
      delay = null;
      authorize();
    } else {inputField = undefined};
  }, 2000);
},false);

function authorize() {
  let error = document.getElementsByClassName("error")[0];
  console.log(error)
  if ( error == undefined) {
    // document.getElementsByTagName("input")[2].click();
  }
}