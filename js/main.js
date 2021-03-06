
const R = new Resolver(LogicOperators);

// aux fucntions
const $ = (query, father) => {
  if (query[0] == "#") {
    return (father ? father : document).querySelector(query);
  } else {
    let ret = (father ? father : document).querySelectorAll(query);
    return (ret.length == 1) ? ret[0] : ret; 
  }
};

function main() {
  $("#resolve").onclick = submitOnClick;

}

function submitOnClick(e) {
  e.preventDefault();
  let loader=$("#loader");
  let tautologia = $("#tautologia");
  let thead=$("#vars");
  let tbody=$("#values");
  const etable=$('table');
  const section = $(".output");
  

  thead.innerHTML="";
  tbody.innerHTML="";
  tautologia.classList.add("hide");
  loader.classList.remove("hide");
  tautologia.classList.remove("tautologia");

  
  setTimeout(() => {
    let expression = $("#expression").value;
  
    let table = R.doTable(expression);

    doom="<tr>";
    for(let p in table[0]) {
      doom+=`<td>${p}</td>`;
    }
    doom+="</tr>";

    thead.innerHTML = doom;

    doom="";
    for(let values of table) {
      doom+="<tr>";
      for(let p in values) {
        doom+=`<td style="color:${(values[p]=="true")?"purple":"gray"}">${values[p]}</td>`;
      }
      doom+="</tr>";
    }
    
    tbody.innerHTML=doom;
    if(table.tautologia) {
      tautologia.classList.remove("hide");
      tautologia.classList.add("tautologia");
      section.style.display = "block";
      etable.style.margin = "0 auto";

    }

    loader.classList.add("hide");
  },0);

}

// init program
window.onload = main;