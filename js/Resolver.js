


class Resolver {

  eCounter = 0;
  deeplog1=false;
  expressions = {};
  GlobalStatus = {};


  getVarsFromExpression(e) {
    let reVars = new RegExp(/[q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,_]([q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,0-9,_]*)?/,"g");
    let r=[...(new Set(e.match(reVars)))];
    return r.filter((v)=>{
      return (v+"")!='true' && (v+"")!="false";
    });
  }

  getPosiblesValues(vars) {
    let states = [];
    for (let i=0; i<2**(vars.length);i++) {
      let binary = (i).toString(2);
      let state = {};
      binary = '0'.repeat(vars.length- binary.length)+binary;
      for(let j=0; j<vars.length; j++) {
        state[vars[j]] = (binary[j] == '1') ? 'true' : 'false';
      }
      console.log(state);
      states.push(state);
    }
    return states;
  }

  doTable(expression){
    let vars = this.getVarsFromExpression(expression);
    console.log("VARS:",vars);
    let states = this.getPosiblesValues(vars);
    let tautologia = true;  
    let resulado, row,table = [];

    for(let state of states){
      this.GlobalStatus=state;
      resulado = this.Resolve(expression);
      row = {...state, [expression]: resulado}
      if (typeof row.true != 'undefined') delete row.true;
      if (typeof row.false != 'undefined') delete row.false;
      table.push(row);
      tautologia = tautologia && parseBool(resulado); 
    }

    if(tautologia) {
      console.log("Es una tautologia");
      table.tautologia = tautologia;
    }
    console.table(table);
    return table;
  }

  constructor(operators) {
    this.operators = operators.sort((a,b) => a.priority - b.priority);
  }

  Resolve(expression) {
    this.expressions = {};
    this.eCounter = 0;
    return this._resolve(expression);
  }

  // core functions
  _resolve(e, v) {
    return this.calculate(this._process(e, v));
  }

  calculate(e) {  
    if ( e === "true" )  return true;
    if ( e === "false" ) return false;
    let op="";

    for(let o of this.operators) {
      if( o.find(e+"") ) {
        op = "[op: "+o.name+" ]: "+e+" »";
        e = o.apply( e + "", this);
        console.log(op, e);
      }
    }

    return e;
  }

  _process(e, v) {
    if (!v) console.log("Expresión:", e);
    
    const reParenthesis = new RegExp(/\([a-z,#,!,->,<->,v,^]*\)/, 'g');
    let matchParenthesis = [...(new Set(e.match(reParenthesis)))];
    let subExp, eID;
    
    if( matchParenthesis.length > 0) {
      for(let i=0; i<matchParenthesis.length; i++) {
        subExp = matchParenthesis[i].slice(1,-1);
        eID= '#'+(this.eCounter++);
        
        console.log("subExpresion[", eID, "]:", subExp);
        
        this.expressions[eID] = this._process(subExp, this.deeplog1);
        e = e.split(matchParenthesis[i]).join(eID);
      }
    } else {
      if (!v) console.log("Expresión procesada:", e);
      return e;
    }
    
    if (!v) console.log("Expresión procesada:", e);

    return this._process(e);
  }

}

// parse boolean
function parseBool(val){
  return val == "true" || val===true
}

function replace(str, inexp, forstr) {
  let outexp = inexp
    .split("true").join("$")
    .split("false").join("@")
    .split(str).join(forstr)
    .split("$").join("true")
    .split("@").join("false");
    return outexp;
}

// operators - logic definition

let LogicOperators = [{
  name:"Referencia  ",
  priority: -5,
  signe:"#",
  find(e) {
    return e.indexOf(this.signe)>-1;
  },
  apply(e, r){
    let reRef = new RegExp(/#[0-9]*/,"g");
    let matchRef = [...(new Set(e.match(reRef)))];
    for(match of matchRef) {
      e = replace(match, e, r._resolve(r.expressions[match], true));
    }
    return e;
  }
},{
  name:"Negación    ",
  priority: 1,
  signe: "!",
  find(e) {
    return e.indexOf(this.signe)>-1;
  },
  apply(e, r){
    let reNot = new RegExp(/![q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,_]([q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,0-9,_]*)?/,"g");
    let matchNot = [...(new Set(e.match(reNot)))];
    for(match of matchNot) {
      e = e.split(match).join(!parseBool(r._resolve(match.slice(1), true)));
    }
    return e;
  }
},{
  name:"Equivalencia",
  priority: 4,
  signe: "=",
  find(e) {
    return e.indexOf(this.signe)>-1;
  },
  apply(e, r) {
    let reOR = new RegExp(/([q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,_]([q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,0-9,_]*)?[=])|([=][q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,_]([q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,0-9,_]*)?)/,"g");
    let parts= e.split(this.signe).join("==").match(reOR).map(v=>v.split("=").join(""));;
    let result = parseBool(r._resolve(parts[0], true));
    for (let i=1; i < parts.length; i++){
      result = result == parseBool(r._resolve(parts[i], true));
    }
    return e.replace(parts.join(this.signe), result);
  }
},{
  name:"Implicancia ",
  priority: 3,
  signe: "->",
  find(e) {
    return e.indexOf(this.signe)>-1;
  },
  apply(e, r) {
    let reThen = new RegExp(/([q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,_]([q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,0-9,_]*)?(->))|((->)[q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,_]([q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,0-9,_]*)?)/,"g");
    let parts = e.split(this.signe).join("->->").match(reThen).map(v=>v.split("->").join(""));
    let result = !parseBool(r._resolve(parts[0], true)) || parseBool(r._resolve(parts[1], true));
    e = e.replace(parts[0]+this.signe+parts[1],result);
    if (this.find(e)) {
      e = this.apply(e);
    }
    return e;
  }
},{
  name:"Conjunción  ",
  priority: 2,
  signe: "^",
  find(e) {
    return e.indexOf(this.signe)>-1;
  },
  apply(e, r) {
    let reAND = new RegExp(/([q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,_]([q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,0-9,_]*)?[\^])|([\^][q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,_]([q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,0-9,_]*)?)/,"g");
    let parts= e.split(this.signe).join("^^").match(reAND).map(v=>v.split("^").join(""));
    let result = true;
    for (let i=0; i < parts.length; i++){
      result = result && parseBool(r._resolve(parts[i],true));
    }
    return e.replace(parts.join(this.signe),result);
  }
},{
  name:"Disyunción  ",
  priority: 2,
  signe: "v",
  find(e) {
    return e.indexOf(this.signe)>-1;
  },
  apply(e, r) {
    let reOR = new RegExp(/([q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,_]([q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,0-9,_]*)?[v])|([v][q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,_]([q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,0-9,_]*)?)/,"g");
    let parts= e.split(this.signe).join("vv").match(reOR).map(v=>v.split("v").join(""));
    let result = false;
    for (let i=0; i < parts.length; i++){
      result = result || parseBool(r._resolve(parts[i], true));
    }
    return e.replace(parts.join(this.signe),result);
  }
},{
  name: "Valorización",
  priority:-1,
  signe: new RegExp(/[q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,_][q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,b,n,m,_,0-9]*/, "g"),
  find(e) {
    return !!e.match(this.signe);
  },
  apply(e, r){
    let vars = [...(new Set(e.match(this.signe)))];
    let value, strVars="| ";
    for(v of vars) {

      if (typeof r.GlobalStatus[v] == 'undefined'){
        if (v=="false" || v=="true") r.GlobalStatus[v] = parseBool(v);
        else console.error("variable '",v,"' no definida!");
      }
      value = r.GlobalStatus[v];
      e = replace(v, e, value);
      strVars+=v+": '"+value+"' | "
    }
    console.log(strVars);
    return e; 
  }
}];