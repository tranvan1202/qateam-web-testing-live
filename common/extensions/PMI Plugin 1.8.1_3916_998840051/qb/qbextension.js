let delay1;
let delay2;
let subNavBar;
let button = document.createElement("button");
button.id = "QBViewButton";
button.class = "btn";
button.innerHTML = `Change View`;
let currentURL;
let currentTitle;
let ticketID;
let prevUrl = undefined;

console.log('QBextension has been launched');

function createButton() {
  currentURL = window.location.href;
  let idposition = currentURL.indexOf('sys_id');
  currentSysID = currentURL.substring(idposition + 7);
  currentTitle = document.title;
  let fullURL = undefined;
  if (currentTitle.includes('INC')){
    ticketID = currentTitle.substring(13, 23);
    fullURL = 'https://pmicit.service-now.com/nav_to.do?uri=%2Fincident.do%3Fsys_id%3D'
    +currentSysID
    +'%26sysparm_view%3Dess%26sysparm_record_target%3Dincident%26sysparm_record_row%3D1%26sysparm_record_rows%3D1%26sysparm_record_list%3Dnumber%3D'
    +ticketID
    +'%5EORDERBYnumber'
  } else if (currentTitle.includes('RITM')){
    ticketID = currentTitle.substring(13, 24);
    fullURL = 'https://pmicit.service-now.com/nav_to.do?uri=%2Fsc_req_item%3Fsys_id%3D'
    +currentSysID
    +'&view=sp%26sysparm_view%3Dess%26sysparm_record_target%3Dincident%26sysparm_record_row%3D1%26sysparm_record_rows%3D1%26sysparm_record_list%3Dnumber%3D'
    +ticketID
    +'%5EORDERBYnumber'
  }
  console.log(fullURL);
  button.onclick = function() {
    window.open(fullURL, '_self');
  };
  subNavBar = document.getElementsByClassName("nav nav-tabs");
  subNavBar[0].appendChild(button);
};

window.addEventListener("load", function load(event){
  window.removeEventListener("load", load, false); //remove listener, no longer needed
  const currUrl = window.location.href;
    if (currUrl.includes('sys_id')){
      delay1 = setInterval(function() {
        // subNavBar = document.getElementsByClassName("nav nav-tabs");
        if (document.getElementById("data.number.name") !== null) {
            createButton();
          clearInterval(delay1);
        };
      }, 100)
  }
},false);

setInterval(() => {
  const currUrl = window.location.href;
  if (currUrl != prevUrl) {
    // URL changed
    prevUrl = currUrl;
    if (currUrl.includes('sys_id=')){
      console.log(`URL changed to a ticket page. Adding the "Change View" button.`);
      delay2 = setInterval(function() {
        if (document.getElementById("data.number.name") !== null) {
            createButton();
          clearInterval(delay2);
        };
      }, 1000)
    }
  }
}, 60);