let isSidePanel = false;
let _document = "";


var addAttribute = function(element, attributeName, attributeValue) {
    if(attributeName.includes('xpath')){
        attributeName = "xpath";
    }
        try{
            element.setAttribute(attributeName, attributeValue);
        }
        catch(err){
            return;
        }
    }
var removeAttribute = function(element, attributeName, onChange) {
    try{
        attributeName = oldAttribute;
        element.removeAttribute(attributeName);
        element.style.outline= "";
    }catch(err){
        return;
    }   
}

var oldNodes = [];
var oldAttribute = "";
var allNodes = [];
var highlightElements = function(xpathOrCss, xpath, onChange) {
    var elements;
    try{
        if(xpathOrCss.includes("xpath")){
            elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);  //xpath
        }else{
            elements = document.querySelectorAll(xpath); //css
        }
    }catch(err){
        if(xpath) {
            sendRuntimeMessage({ count: "wrongXpath" });
        }else {
            sendRuntimeMessage({ count: "blank" });
        }
        for (var i = 0; i < oldNodes.length; i++) {
                removeAttribute(oldNodes[i], xpathOrCss, onChange);
        }
        oldNodes = [];
        allNodes = [];
        return;
    }

    var  totalMatchFound, node;
    if(xpathOrCss.includes("xpath")){   
        totalMatchFound = elements.snapshotLength;  //xpath
    }else{
        totalMatchFound = elements.length;  //css
    }
    for (var i = 0; i < oldNodes.length; i++) {
        removeAttribute(oldNodes[i], xpathOrCss, onChange);
    }
    oldNodes = [];
    allNodes = [];
    
    sendRuntimeMessage({ count: totalMatchFound });

    for (var i = 0; i < totalMatchFound; i++) {
        if(xpathOrCss.includes("xpath")){
             node = elements.snapshotItem(i); //xpath
        }else{
            node = elements[i]; //css
        }
        if(i===0 && !(xpath==="/" || xpath==="." || xpath==="/." || xpath==="//." || xpath==="//..")){
            node.scrollIntoView(false);
        }
        oldNodes.push(node);
        oldAttribute = xpathOrCss;
        addAttribute(node, xpathOrCss, i+1 );
        allNodes.push(node.outerHTML);

    }
    sendRuntimeMessage({ count: allNodes });
};

function createCanvasElement (doc) {
    if (!doc.getElementById("selectorshub-css")) {
          const styles = document.createElement("style");
          styles.innerText = `
            #selectorshub-wrapper {pointer-events: none;top: 0;position: absolute;z-index: 10000000;}
            #selectorshub-canvas {position: relative;};
          `;
          styles.id = "selectorshub-css";
          if(doc.nodeName === "#document-fragment"){
              doc.appendChild(styles);
          }else{
              document.getElementsByTagName("head")[0].appendChild(styles);
          }
    }
    if (!doc.getElementById("selectorshub-canvas")) {
          var html = "<canvas id='selectorshub-canvas' />";
          var element = document.createElement("div");
          element.setAttribute("id", "selectorshub-wrapper");
          element.innerHTML = html;
          if(doc.nodeName === "#document-fragment"){
              doc.appendChild(element);
          }else{
              document.body.appendChild(element);
          }
    }
}

function removeCanvasElement (doc) {
    var wrapperElement = doc.getElementById("selectorshub-wrapper");
    if(wrapperElement) {
        var parent = wrapperElement.parentNode;
        parent.removeChild(wrapperElement);
    }
}

function isInShadow(node) {
    var parent = (node && node.parentNode);
    while(parent) {
        if(parent.toString() === "[object ShadowRoot]") {
            shadowDOMOpenOrClosed = parent.mode.toString(); //to get open or closed shadow root
            return true;
        }
        parent = parent.parentNode;
    }
    return false;
}

let inspectorOverlays = [];

// let inspectorTransparentOverlay;
// let inspectorVisibleOverlay;
const highlightInspectedElement = (event) => {
    const doc = event.target.ownerDocument;
    const iStyle = event.target.getBoundingClientRect();
    const cStyle = window.getComputedStyle(event.target, null);

    let inspectorTransparentOverlay = doc.querySelector(".shub-transparent-inspector");
    let inspectorVisibleOverlay = doc.querySelector(".shub-visible-inspector");
    let commentOverlay = doc.querySelector(".shub-comment-overlay");

    const item = {
      width: iStyle.width,
      height: iStyle.height,
      top: iStyle.top,
      left: iStyle.left,
      pdTop: parseInt(cStyle.paddingTop, 10),
      pdRight: parseInt(cStyle.paddingRight, 10),
      pdBottom: parseInt(cStyle.paddingBottom, 10),
      pdLeft: parseInt(cStyle.paddingLeft, 10),
    };

    const width = item.width - item.pdRight - item.pdLeft;
    const height = item.height - item.pdBottom - item.pdTop;

    // 2.5px added to the height because their is a problem with element that have lineHeight lower than the default value
    inspectorTransparentOverlay.style.width = `${item.width}px`;
    inspectorTransparentOverlay.style.height = `${item.height + 2.5}px`;
    inspectorTransparentOverlay.style.left = `${item.left}px`;
    inspectorTransparentOverlay.style.top = `${item.top}px`;

    inspectorVisibleOverlay.style.width = `${width}px`;
    inspectorVisibleOverlay.style.height = `${height}px`;
    inspectorVisibleOverlay.style.left = `${item.left + item.pdLeft}px`;
    inspectorVisibleOverlay.style.top = `${item.top + item.pdTop}px`;

    inspectorOverlays.forEach((overlay) => {
        if(overlay.doc !== doc){
            if(overlay.ito) overlay.ito.style.width = "0px";
            if(overlay.ito) overlay.ito.style.height = "0px";
            if(overlay.ivo) overlay.ivo.style.width = "0px";
            if(overlay.ivo) overlay.ivo.style.height = "0px";
            if(overlay.co) overlay.co.style.width = "0px";
            if(overlay.co) overlay.co.style.height = "0px";
        }
    });

    let shadowRoot;
    if(event.target.nodeName !== "svg"){
        try {
            shadowRoot = chrome.dom.openOrClosedShadowRoot(event.target);
        } catch (_) {}
    }
    let isInsideOpenShadowRoot = isInShadow(event.target);
    commentOverlay.style.height = "auto";
    // closed shadow root
    if(shadowRoot?.mode === "closed"){
        commentOverlay.innerText = "Can't inspect elements inside closed shadow root";
        commentOverlay.style.width = "fit-content";
        commentOverlay.style.backgroundColor = "#d9433b";
        commentOverlay.style.left = item.left + item.pdLeft + commentOverlay.offsetWidth > window.innerWidth ? `${item.left + item.pdLeft + item.width - commentOverlay.offsetWidth }px` : `${item.left + item.pdLeft}px`;
        commentOverlay.style.top = item.top + item.pdTop - commentOverlay.offsetHeight < 30 ? `${item.top + item.pdTop + height}px` : `${item.top + item.pdTop - commentOverlay.offsetHeight}px`;
    }else if(event.target.nodeName === "IFRAME"){
        try{
            if(!event.target.contentDocument && !event.target.contentWindow.document){
                commentOverlay.innerText = "This element is inside cross origin iframe";
                commentOverlay.style.width = "fit-content";
                // commentOverlay.style.height = "20px";
                commentOverlay.style.backgroundColor = "#d9433b";
                commentOverlay.style.left = item.left + item.pdLeft + commentOverlay.offsetWidth > window.innerWidth ? `${item.left + item.pdLeft + item.width - commentOverlay.offsetWidth }px` : `${item.left + item.pdLeft}px`;
                commentOverlay.style.top = item.top + item.pdTop - commentOverlay.offsetHeight < 30 ? `${item.top + item.pdTop + height}px` : `${item.top + item.pdTop - commentOverlay.offsetHeight}px`;
                inspectorTransparentOverlay.style.width = `0px`;
                inspectorTransparentOverlay.style.height = `0px`;
                inspectorTransparentOverlay.style.left = `0px`;
                inspectorTransparentOverlay.style.top = `0px`;

                inspectorVisibleOverlay.style.width = `0px`;
                inspectorVisibleOverlay.style.height = `0px`;
                inspectorVisibleOverlay.style.left = `0px`;
                inspectorVisibleOverlay.style.top = `0px`;
            }
        }catch(_){
            commentOverlay.innerText = "This element is inside cross origin iframe";
            commentOverlay.style.width = "fit-content";
            // commentOverlay.style.height = "20px";
            commentOverlay.style.backgroundColor = "#d9433b";
            commentOverlay.style.left = item.left + item.pdLeft + commentOverlay.offsetWidth > window.innerWidth ? `${item.left + item.pdLeft + item.width - commentOverlay.offsetWidth }px` : `${item.left + item.pdLeft}px`;
            commentOverlay.style.top = item.top + item.pdTop - commentOverlay.offsetHeight < 30 ? `${item.top + item.pdTop + height}px` : `${item.top + item.pdTop - commentOverlay.offsetHeight}px`;
            inspectorTransparentOverlay.style.width = `0px`;
            inspectorTransparentOverlay.style.height = `0px`;
            inspectorTransparentOverlay.style.left = `0px`;
            inspectorTransparentOverlay.style.top = `0px`;

            inspectorVisibleOverlay.style.width = `0px`;
            inspectorVisibleOverlay.style.height = `0px`;
            inspectorVisibleOverlay.style.left = `0px`;
            inspectorVisibleOverlay.style.top = `0px`;
        }
    }else if(event.target.nodeName === "svg" || event.target.nodeName === "path"){
        commentOverlay.innerText = "This is a svg element";
        commentOverlay.style.width = "fit-content";
        // commentOverlay.style.height = "20px";
        commentOverlay.style.backgroundColor = "rgb(231, 96, 155)";
        commentOverlay.style.left = item.left + item.pdLeft + commentOverlay.offsetWidth > window.innerWidth ? `${item.left + item.pdLeft + item.width - commentOverlay.offsetWidth }px` : `${item.left + item.pdLeft}px`;
        commentOverlay.style.top = item.top + item.pdTop - commentOverlay.offsetHeight < 30 ? `${item.top + item.pdTop + height}px` : `${item.top + item.pdTop - commentOverlay.offsetHeight}px`;
    }else if(isInsideOpenShadowRoot){
        commentOverlay.innerText = "This element is inside shadow dom";
        commentOverlay.style.width = "fit-content";
        // commentOverlay.style.height = "20px";
        commentOverlay.style.backgroundColor = "rgb(68, 150, 236)";
        commentOverlay.style.left = item.left + item.pdLeft + commentOverlay.offsetWidth > window.innerWidth ? `${item.left + item.pdLeft + item.width - commentOverlay.offsetWidth }px` : `${item.left + item.pdLeft}px`;
        commentOverlay.style.top = item.top + item.pdTop - commentOverlay.offsetHeight < 30 ? `${item.top + item.pdTop + height}px` : `${item.top + item.pdTop - commentOverlay.offsetHeight}px`;
    }else if(doc.defaultView.self !== window.top){
        commentOverlay.innerText = "This element is inside iframe";
        commentOverlay.style.width = "fit-content";
        // commentOverlay.style.height = "20px";
        commentOverlay.style.backgroundColor = "rgb(116, 114, 114)";
        commentOverlay.style.left = item.left + item.pdLeft + commentOverlay.offsetWidth > window.innerWidth ? `${item.left + item.pdLeft + item.width - commentOverlay.offsetWidth }px` : `${item.left + item.pdLeft}px`;
        commentOverlay.style.top = item.top + item.pdTop - commentOverlay.offsetHeight < 30 ? `${item.top + item.pdTop + height}px` : `${item.top + item.pdTop - commentOverlay.offsetHeight}px`;
    }else{
        commentOverlay.innerText = "";
        commentOverlay.style.width = "0px";
        commentOverlay.style.height = "0px";
    }
  
    // canvas.style.top = `${Math.abs(document.body.getBoundingClientRect().top)}px`;
}

const onInspectElementClickEvent = (event) => {
    let doc = event.target.ownerDocument;
    if(event.button === 2) return;
    event.preventDefault();
    event.stopPropagation();
    let node = event.target;
    this.blur();
    window.focus();

    let inspectorTransparentOverlay = doc.querySelector(".shub-transparent-inspector");
    
    inspectorTransparentOverlay.style.pointerEvents = "auto";

    let oldInspectedElement = doc.querySelector("[shub-ins='1']");
    if(oldInspectedElement){
        oldInspectedElement.removeAttribute("shub-ins");
    }

    let nodeMap = node.attributes;
    let attribute = document.createAttribute("shub-ins");
    attribute.value = "1";
    nodeMap.setNamedItem(attribute);
    node.setAttribute('sh-att','1');
    _document = document;
    sendRuntimeMessage({ action: "select-inspected-element", baseUri: node.baseURI });
}

function onMouseUp(event){
    let doc = event.target.ownerDocument;

    let inspectorTransparentOverlay = doc.querySelector(".shub-transparent-inspector");
    inspectorTransparentOverlay.style.pointerEvents = "none";
    removeInspectListeners();
    sendRuntimeMessage({ action: "toggle-inspector" });
}

function onMouseOut(event){
    try{
    let doc = event.target.ownerDocument || event.target;

    let inspectorTransparentOverlay = doc.querySelector(".shub-transparent-inspector");
    let inspectorVisibleOverlay = doc.querySelector(".shub-visible-inspector");
    let commentOverlay = doc.querySelector(".shub-comment-overlay");
        inspectorTransparentOverlay.style.width = "0px";
        inspectorVisibleOverlay.style.height = "0px";
        commentOverlay.style.height = "0px";
    }catch(_){};
}


function sendRuntimeMessage(message){
   chrome.runtime.sendMessage(message);
}


function onContextMenu(event){
    event.preventDefault();
    sendRuntimeMessage({action: "toggle-inspector"});
    removeInspectListeners();
    return false;
}

let docs = [];

function findAllDocuments(){
    docs = [{doc: document, type: "main"}];

    function r(doc){
        let elements = Array.from(doc.querySelectorAll("*")).filter(i => i.shadowRoot);
        elements = [...elements, ...doc.querySelectorAll("iframe")];
        elements.forEach(el => {
            if(el.shadowRoot){
                docs.push({ doc: el.shadowRoot, type: "shadowRoot" });
                r(el.shadowRoot);
            }else{
                try{
                    let iframeDoc = el.contentDocument || el.contentWindow.document;
                    docs.push({doc: iframeDoc, type: "iframe"});
                    r(iframeDoc);
                }catch(_){
                    console.log("error: ", _)
                }
            }
        });
    }

    r(document);
}
function addInspectListeners() {
    findAllDocuments();
    docs.forEach(({doc, type}) => {
        createCanvasElement(doc);
        try{
            doc.querySelector(".shub-transparent-inspector").remove();
            doc.querySelector(".shub-visible-inspector").remove();
            doc.querySelector(".shub-comment-overlay").remove();
        }catch(_){}
        
        let obj = {doc, type};
        if(doc.nodeName !== "#document-fragment"){
            let inspectorTransparentOverlay = document.createElement("div");
            let inspectorVisibleOverlay = document.createElement("div");
            let commentOverlay = document.createElement("div");
            
            inspectorTransparentOverlay.setAttribute("class", "shub-transparent-inspector");
            inspectorVisibleOverlay.setAttribute("class", "shub-visible-inspector");
            commentOverlay.setAttribute("class", "shub-comment-overlay");
            doc.body.appendChild(inspectorTransparentOverlay);
            doc.body.appendChild(inspectorVisibleOverlay);
            doc.body.appendChild(commentOverlay);

            obj = {...obj, ito: inspectorTransparentOverlay, ivo: inspectorVisibleOverlay, co: commentOverlay };
        }

        inspectorOverlays.push(obj);
     
        doc.addEventListener('mouseover', highlightInspectedElement, true);
        doc.addEventListener('mousedown', onInspectElementClickEvent);
        doc.addEventListener('mouseup', onMouseUp);
        doc.addEventListener("mouseleave", onMouseOut);
        // document.addEventListener('focus', onInspectElementClickEvent);
        // doc.addEventListener('contextmenu', onContextMenu);
    })
}

function removeInspectListeners() {
    docs.forEach(({ doc }) => {
        removeCanvasElement(doc);
    
        try{
            let inspectorTransparentOverlay = doc.querySelector(".shub-transparent-inspector");
            let inspectorVisibleOverlay = doc.querySelector(".shub-visible-inspector");
            let commentOverlay = doc.querySelector(".shub-comment-overlay");

            inspectorTransparentOverlay.remove();
            inspectorVisibleOverlay.remove();
            commentOverlay.remove();
        }catch(_){}

        inspectorOverlays = [];
    
        doc.removeEventListener('mouseover', highlightInspectedElement, true);
        doc.removeEventListener('mousedown', onInspectElementClickEvent);
        doc.removeEventListener('mouseup', onMouseUp);
        doc.addEventListener("mouseleave", onMouseOut);
        // document.removeEventListener('focus', onInspectElementClickEvent);
        // doc.removeEventListener('contextmenu', onContextMenu);
    });
}


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    this.tempXpath = ""; //resetting it
    this.indexes = [];
    this.matchIndex = [];
    if (message.name === "inspect-element") {
        if(message.enable) {
            addInspectListeners();
        } else {
            removeInspectListeners();
        }
        return;
    }

    if (message.xpath || message.xpath === "") {
        if(!message.xpath[1]){
            message.name = 'xpath';
        }else if(message.xpath[1].charAt(0).includes("/")){
            message.name = 'xpath';
        }else{
            message.name = 'css';
        }
        highlightElements(message.name, message.xpath[1], message.xpath[2]);
    }
    if (message.name === "xpath") {
        var ele = document.querySelector('[xpath="' + message.index +'"]');
        if(ele){
            ele.style.outline= "2px dotted orangered";
            if(!message.isSidePanel){
                ele.scrollIntoView(false);
            }
        }    
    }
    if (message.name === "xpath-remove") {
        var ele = document.querySelector('[xpath="' + message.index +'"]');
        if(ele){
            ele.style.outline= "";
        }
    }
    if (message.name === "css") {
        var ele = document.querySelector('[css="' + message.index +'"]');
        if(ele){
            ele.style.outline= "2px dotted orangered";
            if(!message.isSidePanel){
                ele.scrollIntoView(false);
            }
        }    
    }
    if (message.name === "css-remove") {
        var ele = document.querySelector('[css="' + message.index +'"]');
        if(ele){
            ele.style.outline= "";
        }
    }
});

function generateAbsXpath(element) {
    if (element.tagName.toLowerCase()==='html')
        return '/html[1]';
    if (element.tagName.toLowerCase()==='body')
        return '/html[1]/body[1]';

    var ix= 0;
    var siblings= element.parentNode.childNodes;
    for (var i= 0; i<siblings.length; i++) {
        var sibling= siblings[i];
        if (sibling===element){
            if(element.tagName.toLowerCase().includes('svg')){
                return "this node is the child of svg & svg child don't support xpath so xpath can't be generated for this element.";
            }else{
                var absXpath = generateAbsXpath(element.parentNode)+'/'+element.tagName.toLowerCase()+'['+(ix+1)+']';
                return absXpath;
            }
        }
        if (sibling.nodeType===1 && sibling.tagName.toLowerCase()===element.tagName.toLowerCase()){
            ix++;
        }
    }
}

var tempXpath="";
var indexes = []; 
var matchIndex = [];

function isInsideIframe (node) {
    var child = true;
    var frameOrNot = node.ownerDocument;
    while(child){
        try{
            var temp = frameOrNot.ownerDocument;
            frameOrNot = temp;
        }catch(err){
            child = false;
        }
    }
    return frameOrNot !== document;

}

function generateRelXpath(element) {
    var innerText = element.textContent.trim().slice(0,50);
    var tagName = element.tagName.toLowerCase();
    // if(isInsideIframe(element)){
    //     return "this element is inside iframe so xpath can't be generated.";
    // }
    if(tagName.includes('svg') && this.tempXpath){
        this.tempXpath = "this node is the child of svg & svg child don't support xpath so xpath can't be generated for this element.";
        return this.tempXpath;
    }
    if(tagName.includes('svg') && !this.tempXpath){
        tagName = "*";
    }
    
    if(innerText.includes("'")){
        containsText = '[contains(text(),"'+innerText+'")]';
        equalsText = '[text()="'+innerText+'"]';
    }else{
        containsText = "[contains(text(),'"+innerText+"')]";
        equalsText = "[text()='"+innerText+"']";
    }
    if (element.tagName.toLowerCase().includes('html')){
        return '/html'+this.tempXpath;
    }
    var attr="";
    var attrValue="";

    if (element.id!==''){
        this.tempXpath = '//'+tagName+"[@id='"+element.id+"']"+this.tempXpath;
        var totalMatch = document.evaluate(this.tempXpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;
        if(totalMatch===1){
            return this.tempXpath;
        }else{
            this.tempXpath = this.tempXpath;
        }
    }else if(element.attributes.length!=0){
        for(var i=0; i<element.attributes.length; i++){
            attr = element.attributes[i].name;
            attrValue = element.attributes[i].nodeValue;
            if (attrValue!=null && attrValue!="" && !attr.includes("style") && !attr.includes("xpath")){
                break;
            }    
        }
        
        if(attrValue!=null && attrValue!="" && !attr.includes("xpath")){
            var xpathWithoutAttribute = this.tempXpath;
            var xpathWithAttribute = "";
            if(attrValue.includes("'")){
                if(attrValue.charAt(0)===" " || attrValue.charAt(attrValue.length-1)===" "){
                   xpathWithAttribute = '//'+tagName+'[contains(@'+attr+',"'+attrValue.trim()+'")]'+this.tempXpath;
                }else{
                   xpathWithAttribute = '//'+tagName+'[@'+attr+'="'+attrValue+'"]'+this.tempXpath;
                }
            }else{
                if(attrValue.charAt(0)===" " || attrValue.charAt(attrValue.length-1)===" "){
                   xpathWithAttribute = '//'+tagName+"[contains(@"+attr+",'"+attrValue.trim()+"')]"+this.tempXpath;
                }else{
                   xpathWithAttribute = '//'+tagName+"[@"+attr+"='"+attrValue+"']"+this.tempXpath;
                }
            }
            
            var totalMatch = document.evaluate(xpathWithAttribute, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;
            if(totalMatch===1){
                return xpathWithAttribute;
            }else if(innerText && element.getElementsByTagName('*').length===0){
                var containsXpath = xpathWithAttribute+containsText;
                var totalMatch = document.evaluate(containsXpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;
                if(totalMatch===0){
                    var equalsXpath = xpathWithAttribute+equalsText;
                    var totalMatch = document.evaluate(equalsXpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;
                    if(totalMatch===1){
                        return equalsXpath;
                    }
                }else if(totalMatch===1){
                    return containsXpath;
                }else if(attrValue.includes('/') || innerText.includes('/')){
                    if(attrValue.includes('/')){
                        containsXpath = xpathWithoutAttribute+containsText;
                    }
                    if(innerText.includes('/')){
                        containsXpath = containsXpath.replace(containsText,"");
                    }
                    this.tempXpath = containsXpath;
                }else{
                    this.tempXpath = containsXpath;
                }
            }else{
                this.tempXpath = xpathWithAttribute;
                if(attrValue.includes('/')){
                   this.tempXpath = "//"+tagName+xpathWithoutAttribute;
                }
            }
        }else if(attrValue==null || attrValue=="" || attr.includes("xpath")){
            this.tempXpath = "//"+tagName+this.tempXpath;
        }
        if(tagName.includes('*')){
            tagName = " ";
            return this.tempXpath;
        }     
    }else if(attrValue=="" && innerText && element.getElementsByTagName('*').length===0){
        var containsXpath = '//'+tagName+containsText+this.tempXpath;
        var totalMatch = document.evaluate(containsXpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;
        if(totalMatch===0){
            this.tempXpath = '//'+tagName+equalsText+this.tempXpath;
            var totalMatch = document.evaluate(this.tempXpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;
            if(totalMatch===1){
                return this.tempXpath;
            }
        }else if(totalMatch===1){
            return containsXpath;
        }else{
            this.tempXpath = containsXpath;
        } 
    }else{
        this.tempXpath = "//"+tagName+this.tempXpath;
    }

    var ix= 0;
    
    var siblings= element.parentNode.childNodes;
    for (var i= 0; i<siblings.length; i++) {
        var sibling= siblings[i];
        if (sibling===element){
                indexes.push(ix+1);            
                this.tempXpath = generateRelXpath(element.parentNode);
                if(!this.tempXpath.includes("/")){
                    return this.tempXpath;
                }else{
                    var totalMatch = document.evaluate(this.tempXpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;
                    if(totalMatch===1){
                        return this.tempXpath;
                    }else{
                        this.tempXpath = "/"+this.tempXpath.replace(/\/\/+/g, '/');
                        var regSlas = /\/+/g;
                        var regBarces = /[^[\]]+(?=])/g;
                        while ((match = regSlas.exec(this.tempXpath)) != null) {
                           matchIndex.push(match.index);
                        }
                        for(var j=0; j<indexes.length; j++){
                            if(j===0){
                                var lastTag = this.tempXpath.slice(matchIndex[matchIndex.length-1]);
                                if((match = regBarces.exec(lastTag)) != null){
                                    lastTag = lastTag.replace(regBarces,indexes[j]);
                                    this.tempXpath = this.tempXpath.slice(0, matchIndex[matchIndex.length-1])+lastTag;
                                }else{
                                    this.tempXpath = this.tempXpath+"["+indexes[j]+"]";
                                }
                            }else{
                                var lastTag = this.tempXpath.slice(matchIndex[matchIndex.length-(j+1)],matchIndex[matchIndex.length-(j)]);
                                if((match = regBarces.exec(lastTag)) != null){
                                    lastTag = lastTag.replace(regBarces,indexes[j]);
                                    this.tempXpath = this.tempXpath.slice(0, matchIndex[matchIndex.length-(j+1)])+lastTag+this.tempXpath.slice(matchIndex[matchIndex.length-j]);
                                }else{
                                    this.tempXpath = this.tempXpath.slice(0, matchIndex[matchIndex.length-j]) +"["+indexes[j]+"]"+ this.tempXpath.slice(matchIndex[matchIndex.length-j]);
                                }
                            }
                            var totalMatch = document.evaluate(this.tempXpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;
                            if(totalMatch===1){
                                var regSlashContent = /([a-zA-Z])([^/]*)/g; 
                                var length = this.tempXpath.match(regSlashContent).length;
                                for(var k=j+1; k<length-1; k++){
                                    var lastTag = this.tempXpath.match(/\/([^\/]+)\/?$/)[1];
                                    var arr = this.tempXpath.match(regSlashContent);
                                    arr.splice(length-k,1,'/');
                                    var relXpath="";
                                    for(var i=0; i< arr.length; i++){
                                        if(arr[i]){
                                            relXpath = relXpath+"/"+arr[i];
                                        }else{
                                            relXpath = relXpath+"//"+arr[i];
                                        }
                                    }
                                    relXpath = (relXpath+"/"+lastTag).replace(/\/\/+/g, '//');
                                    var totalMatch = document.evaluate(relXpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;
                                    if(totalMatch===1){
                                        this.tempXpath = relXpath;
                                    }
                                }
                                return this.tempXpath.replace('//html','');;
                            }
                        }
                    }
                }                
        }
        if (sibling.nodeType===1 && sibling.tagName.toLowerCase()===element.tagName.toLowerCase()){
            ix++;
        }
    }
}


function getNodename(element) {
    var name = "", className;
    if (element.classList.length) {
        name = [element.tagName.toLowerCase()];
        className = element.className.trim();
        className = className.replace(/  +/g, ' ');
        name.push(className.split(" ").join("."));
        name = name.join(".")
    }
    return name;
}

function getChildNumber(node) {
    var classes = {}, i, firstClass, uniqueClasses;
    var parentNode = node.parentNode, childrenLen;
    childrenLen= parentNode.children.length;
    for (i = 0; i < childrenLen; i++) {
        if (parentNode.children[i].classList.length) {
            firstClass = parentNode.children[i].classList[0];
            if (!classes[firstClass]) {
                classes[firstClass] = [parentNode.children[i]]
            } else {
                classes[firstClass].push(parentNode.children[i])
            }
        }
    }
    uniqueClasses = Object.keys(classes).length || -1;
    var obj = {
        childIndex : -1,
        childLen : childrenLen
    }


    if (classes[Object.keys(classes)[0]] === childrenLen) {
        obj.childIndex = Array.prototype.indexOf.call(classes[node.classList[0]], node);
        obj.childLen = classes[Object.keys(classes)[0]].length;
        return obj
    } else if (uniqueClasses && uniqueClasses!== -1  && uniqueClasses !== childrenLen) {
        obj.childIndex = Array.prototype.indexOf.call(parentNode.children, node);
        obj.childLen = classes[Object.keys(classes)[0]].length;
        return obj
    } else if(uniqueClasses === -1){
        obj.childIndex = Array.prototype.indexOf.call(parentNode.children, node);
        obj.childLen = childrenLen;
        return obj
    }else{
        return obj
    }
}


function parents(element, _array) {
    var name, index;
    if (_array === undefined) {
        _array = [];
    }
    else {
        index = getChildNumber(element);
        name = getNodename(element);
        if (name) {
            if (index.childLen >= 1 && index.childIndex !== -1) {
                name += ":nth-child(" + ( index.childIndex + 1) + ")"
            }
            _array.push(name);
        }else if(_array.length <5){
            name = element.tagName.toLowerCase();
            if (index.childIndex !== -1) {
                name += ":nth-child(" + ( index.childIndex + 1) + ")"
            }
            _array.push(name);
        }
    }
    if (element.tagName !== 'BODY') return parents(element.parentNode, _array);
    else return _array;
}


function generateCSS(el) {
    
    if (!(el instanceof Element))
        return;
    var path = parents(el, []);
    path = path.reverse();
    var lastNode = path.slice(path.length -1, path.length);
    
    var _path = path.slice(0,path.length -1);
    if(_path.length!=0){
        return _path.join(" ") + " > "+ lastNode;
    }
    else{  //hack for body tag which is the 1st tag in html page
        return lastNode;
    }
}