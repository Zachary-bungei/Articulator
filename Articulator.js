
(function () {
  let strokeColor = "";
    class ArticulatorElement extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", "0 0 100 100");
        this.svg.setAttribute("fill", "none");
        this.svg.setAttribute("stroke-linecap", "r");
        this.svg.setAttribute("stroke-linejoin", "r");
  
        const style = document.createElement("style");
        style.textContent = `
        :host {
          display: inline-block;
          cursor: pointer; 
        }
        svg {
          width: 100%;
          height: 100%;
          transition: stroke 0.3s, transform 0.3s; 
        }
        :host(:hover) svg path,
        :host(:hover) svg circle,
        :host(:hover) svg rect {
          stroke: ${strokeColor}; 
        }
      `;

  
      this.shadowRoot.append(style, this.svg);
      }
  
      static get observedAttributes() {
        return ["name", "theme", "size", "IconWeight"];
      }
  
      connectedCallback() {
        this.updateSize();
        this.render();
      }
  
      attributeChangedCallback() {
        this.updateSize();
        this.render();
      }
  
      updateSize() {
        const size = this.getAttribute("size") || "3rem";
        this.style.width = size;
        this.style.height = size;
      }
  
      clear() {
        while (this.svg.firstChild) {
          this.svg.removeChild(this.svg.firstChild);
        }
      }
  
      render() {
        this.clear();
        let name = this.getAttribute("name") || "box";
        // let theme = this.getAttribute("theme") || "light";
        let w = this.getAttribute("IconWeight") || "bold";
        strokeColor = this.getAttribute("color") || "black";
        let isvacolor = isValidColor(strokeColor);
        if (!isvacolor) {
            strokeColor = "black"; 
        }


        const iconData = ArticulatorLibrary[name];
        if (!iconData) {
          console.warn(`You have entered invalid name "${name}".view available icons through [<script>
              const result = Articulator.help({});
              console.log(result)
          </script>]`)
          return;
        }
  
  
        iconData(w).ct.forEach(ct => {
          if (ct.t === "l") {
            this.drawLine(ct.p, strokeColor);
          }
          else if (ct.t === "h") {
            this.drawShape(ct.p, strokeColor);
          }
          else if(ct.t === "sl"){
            this.drawstrLine(ct.p, strokeColor);
          }
        });
      }
  
    drawLine(p, strokeColor) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const { s, e, c } = p;
      let d = `M ${s.x} ${s.y} `;
      if (c) {
          d += `Q ${c.x} ${c.y} ${e.x} ${e.y}`;
      } else {
          d += `L ${e.x} ${e.y}`;
      }
      path.setAttribute("d", d);

      path.setAttribute("stroke", strokeColor);
      // Other attributes
      path.setAttribute("stroke-width", p.thickness || 4);
      path.setAttribute("stroke-linecap", p.n === "r" ? "round" : "butt");
      path.setAttribute("opacity", p.opacity ?? 1);

      if (p.remove) {
          // If p.remove === true, remove the path (optional feature)
          this.svg.style.backgroundColor = strokeColor;
          this.svg.removeChild(path);
      } else {
          this.svg.appendChild(path);
      }
    }
    drawstrLine(p, strokeColor) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const { s, e } = p;
    
        // Always draw a straight line
        const d = `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
        path.setAttribute("d", d);
    
        path.setAttribute("stroke", strokeColor);
        path.setAttribute("fill", "none"); // important for paths that are lines
        path.setAttribute("stroke-width", p.thickness || 4);
        path.setAttribute("stroke-linecap", p.corners === "r" ? "round" : "butt");
        path.setAttribute("opacity", p.opacity ?? 1);
    
        if (p.remove) {
            this.svg.style.backgroundColor = strokeColor;
            this.svg.removeChild(path);
        } else {
            this.svg.appendChild(path);
        }
    }
  
    drawShape(p, strokeColor) {
        // Allowed SVG shapes
        const allowedShapes = ["circle", "rect", "line", "ellipse", "polygon", "path"];

        if (!allowedShapes.includes(p.t)) {
          console.warn(`Shape type "${p.t}" not allowed.`);
          return;
        }
      
        // Create the SVG element dynamically based on type
        const el = document.createElementNS("http://www.w3.org/2000/svg", p.t);
      
        // Set attributes depending on type
        switch (p.t) {
          case "circle":
            el.setAttribute("cx", p.center.x);
            el.setAttribute("cy", p.center.y);
            el.setAttribute("r", p.radius);
            break;
      
          case "rect":
            el.setAttribute("x", p.position.x);
            el.setAttribute("y", p.position.y);
            el.setAttribute("width", p.width);
            el.setAttribute("height", p.height);
            if (p.rounder) {
              el.setAttribute("rx", p.r.rx ?? 0);
              el.setAttribute("ry", p.r.ry ?? 0);
            }
            break;
      
          case "line":
            el.setAttribute("x1", p.s.x);
            el.setAttribute("y1", p.s.y);
            el.setAttribute("x2", p.e.x);
            el.setAttribute("y2", p.e.y);
            break;
      
          case "ellipse":
            el.setAttribute("cx", p.center.x);
            el.setAttribute("cy", p.center.y);
            el.setAttribute("rx", p.rx);
            el.setAttribute("ry", p.ry);
            break;
      
          case "polygon":
            el.setAttribute("points", p.points.map(pt => `${pt.x},${pt.y}`).join(" "));
            break;
      
          case "path": 
            el.setAttribute("d", p.d); 
            break;
        }
      

        // Common fill/outline/opacity handling
        if (p.outline > 0) {
          el.setAttribute("stroke", strokeColor);
          el.setAttribute("stroke-width", p.outline);
          el.setAttribute("fill", "none");
        } else {
          el.setAttribute("fill", p.color || strokeColor);
        }
        el.setAttribute("opacity", p.opacity ?? 1);
      
        // Append to SVG
        this.svg.appendChild(el);
      }
    }

      const ArticulatorLibrary = { 
        menu: (w) => ({
          ct: [
            { t: "l", o: "a", p: { s: { x: 20, y: 30 }, e: { x: 80, y: 30 }, t: w === "bold" ? 10 : 3, n: "r" }},
            { t: "l", o: "a", p: { s: { x: 20, y: 50 }, e: { x: 80, y: 50 }, t: w === "bold" ? 10 : 3, n: "r" }},
            { t: "l", o: "a", p: { s: { x: 20, y: 70 }, e: { x: 80, y: 70 }, t: w === "bold" ? 10 : 3, n: "r" }}
          ]
        }),
        folder: (w) => 
        ({ct:[
          {
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":16,"y":73},
                "e": {"x":84,"y":73},
                "c": {"x":84,"y":73},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":16,"y":27},
                "e": {"x":84,"y":27},
                "c": {"x":84,"y":27},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":16,"y":27},
                "e": {"x":16,"y":73},
                "c": {"x":16,"y":50},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":84,"y":27},
                "e": {"x":84,"y":73},
                "c": {"x":84,"y":73},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":22,"y":33},
                "e": {"x":77,"y":33},
                "c": {"x":77,"y":33},
                "n": "r",
                "t": w === "bold" ? 4 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":16,"y":21},
                "e": {"x":40,"y":21},
                "c": {"x":40,"y":21},
                "n": "r",
                "t": w === "bold" ? 4 : 3
              }
            }]}),
        resize: (w) => 
          ({ct:[ {
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":55,"y":55},
                  "e": {"x":84,"y":84},
                  "c": {"x":50,"y":50},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":84,"y":84},
                  "e": {"x":84,"y":55},
                  "c": {"x":84,"y":55},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":52,"y":84},
                  "e": {"x":84,"y":84},
                  "c": {"x":52,"y":84},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":45,"y":45},
                  "e": {"x":16,"y":16},
                  "c": {"x":45,"y":45},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":16,"y":16},
                  "e": {"x":42,"y":16},
                  "c": {"x":42,"y":16},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":16,"y":16},
                  "e": {"x":16,"y":43},
                  "c": {"x":16,"y":43},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
            }]}),
        card: (w) => 
          ({ct:[ 
            {
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":16,"y":73},
                  "e": {"x":85,"y":74},
                  "c": {"x":85,"y":74},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":16,"y":29},
                  "e": {"x":85,"y":29},
                  "c": {"x":16,"y":29},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":16,"y":73},
                  "e": {"x":16,"y":29},
                  "c": {"x":16,"y":29},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":85,"y":29},
                  "e": {"x":85,"y":74},
                  "c": {"x":85,"y":74},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":16,"y":35},
                  "e": {"x":85,"y":35},
                  "c": {"x":71,"y":35},
                  "n": "r",
                  "t": w === "bold" ? 3 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":16,"y":38},
                  "e": {"x":85,"y":38},
                  "c": {"x":50,"y":38},
                  "n": "r",
                  "t": w === "bold" ? 6 : 6
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":40,"y":56},
                  "e": {"x":29,"y":56},
                  "c": {"x":28,"y":56},
                  "n": "r",
                  "t": w === "bold" ? 4 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":28,"y":51},
                  "e": {"x":49,"y":51},
                  "c": {"x":39,"y":51},
                  "n": "r",
                  "t": w === "bold" ? 4 : 3
                }
              }]}),
        link: (w) => 
          ({ct:[ {
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":19,"y":35},
                  "e": {"x":31,"y":35},
                  "c": {"x":50,"y":35},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":63,"y":63},
                  "e": {"x":82,"y":63},
                  "c": {"x":50,"y":63},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":80,"y":36},
                  "e": {"x":91,"y":50},
                  "c": {"x":91,"y":39},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":80,"y":63},
                  "e": {"x":91,"y":50},
                  "c": {"x":91,"y":59},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":29,"y":49},
                  "e": {"x":71,"y":49},
                  "c": {"x":50,"y":49},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":7,"y":48},
                  "e": {"x":21,"y":35},
                  "c": {"x":7,"y":37},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":7,"y":48},
                  "e": {"x":20,"y":62},
                  "c": {"x":8,"y":60},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":34,"y":63},
                  "e": {"x":18,"y":62},
                  "c": {"x":50,"y":63},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":82,"y":36},
                  "e": {"x":64,"y":35},
                  "c": {"x":50,"y":35},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              }]}),
        database: (w) => 
          ({ct:[ {
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":17,"y":73},
                  "e": {"x":71,"y":74},
                  "c": {"x":17,"y":73},
                  "n": "r",
                  "t": w === "bold" ? 4 : 2
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":17,"y":60},
                  "e": {"x":71,"y":61},
                  "c": {"x":48,"y":61},
                  "n": "r",
                  "t": w === "bold" ? 4 : 2
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":17,"y":32},
                  "e": {"x":71,"y":32},
                  "c": {"x":71,"y":32},
                  "n": "r",
                  "t": w === "bold" ? 4 : 2
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":17,"y":73},
                  "e": {"x":17,"y":32},
                  "c": {"x":17,"y":73},
                  "n": "r",
                  "t": w === "bold" ? 3 : 2
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":71,"y":32},
                  "e": {"x":71,"y":74},
                  "c": {"x":71,"y":32},
                  "n": "r",
                  "t": w === "bold" ? 4 : 2
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":17,"y":32},
                  "e": {"x":27,"y":25},
                  "c": {"x":27,"y":25},
                  "n": "r",
                  "t": w === "bold" ? 4 : 2
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":17,"y":46},
                  "e": {"x":71,"y":46},
                  "c": {"x":71,"y":46},
                  "n": "r",
                  "t": w === "bold" ? 4 : 2
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":27,"y":25},
                  "e": {"x":79,"y":25},
                  "c": {"x":79,"y":25},
                  "n": "r",
                  "t": w === "bold" ? 4 : 2
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":79,"y":25},
                  "e": {"x":79,"y":65},
                  "c": {"x":79,"y":65},
                  "n": "r",
                  "t": w === "bold" ? 4 : 2
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":79,"y":65},
                  "e": {"x":71,"y":74},
                  "c": {"x":79,"y":65},
                  "n": "r",
                  "t": w === "bold" ? 4 : 2
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":79,"y":25},
                  "e": {"x":71,"y":32},
                  "c": {"x":71,"y":32},
                  "n": "r",
                  "t": w === "bold" ? 4 : 2
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                    "s": {"x":22,"y":39},
                    "e": {"x":56,"y":39},
                    "c": {"x":56,"y":39},
                    "n": "r",
                    "t": w === "bold" ? 4 : 2
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":23,"y":53},
                  "e": {"x":56,"y":54},
                  "c": {"x":56,"y":54},
                  "n": "r",
                  "t": w === "bold" ? 4 : 2
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":21,"y":67},
                  "e": {"x":56,"y":67},
                  "c": {"x":21,"y":67},
                  "n": "r",
                  "t": w === "bold" ? 4 : 2
                }
              },{
              "t": "h",
              "o": "a",
              "p": {
                "t": "circle",
                "center": {"x":65,"y":54},
                "radius": 3,
                "n": "r",
                "outline": w === "bold" ? 4 : 2
              }
            },{
              "t": "h",
              "o": "a",
              "p": {
                "t": "circle",
                "center": {"x":64,"y":67},
                "radius": 3,
                "n": "r",
                "outline": w === "bold" ? 4 : 2
              }
            },{
              "t": "h",
              "o": "a",
              "p": {
                "t": "circle",
                "center": {"x":64,"y":39},
                "radius": 3,
                "n": "r",
                "outline": w === "bold" ? 4 : 2
              }
            },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":75,"y":36},
                  "e": {"x":75,"y":61},
                  "c": {"x":75,"y":36},
                  "n": "r",
                  "t": w === "bold" ? 4 : 2
                }
              }]}),
        user: (w) => ({
          ct: [
            { t: "h", o: "a", p: { t: "circle", center: { x: 50, y: 35 }, radius: 15, outline: w==="bold"?6:3 }},
            { t: "l", o: "a", p: { s: { x: 20, y: 80 }, e: { x: 80, y: 80 }, c: { x: 50, y: 50 }, t: w==="bold"?6:3 }}
          ]
        }),
        home: (w) => ({
          ct: [
            { t: "l", o: "a", p: { s:{x:20,y:55}, e:{x:50,y:25}, n: "r", t: w==="bold"?6:3 }},
            { t: "l", o: "a", p: { s:{x:50,y:25}, e:{x:80,y:55}, n: "r", t: w==="bold"?6:3 }},
            { t: "l", o: "a", p: { s:{x:30,y:55}, e:{x:30,y:80}, n: "r", t: w==="bold"?6:3  }},
            { t: "l", o: "a", p: { s:{x:70,y:55}, e:{x:70,y:80}, n: "r",  t: w==="bold"?6:3  }},
            { t: "l", o: "a", p: { s:{x:30,y:80}, e:{x:70,y:80}, n: "r", t: w==="bold"?6:3  }}
          ]
        }),
        
        search: (w) => ({
          ct: [
            { t:"h", o:"a", p:{ t:"circle", center:{x:45,y:45}, radius:22, outline: w==="bold"?6:3 }},
            { t:"l", o:"a", p:{ s:{x:58,y:58}, e:{x:75,y:75}, t: w==="bold"?6:3 }}
          ]
        }),
        
        settings: (w) => ({
          ct: [
            { t:"h", o:"a", p:{ t:"circle", center:{x:50,y:50}, radius:13, outline: w==="bold"?6:3 }},
            { t:"h", o:"a", p:{ t:"circle", center:{x:50,y:50}, radius:44, outline: w==="bold"?6:3 }},
            { t:"h", o:"a", p:{ t:"circle", center:{x:50,y:50}, radius:25, outline: w==="bold"?6:3 }},
            { t:"l", o:"a", p:{ s:{x:50,y:15}, e:{x:50,y:30}, n: "r", t: w==="bold"?6:3}},
            { t:"l", o:"a", p:{ s:{x:50,y:70}, e:{x:50,y:85}, n: "r", t: w==="bold"?6:3 }},
            { t:"l", o:"a", p:{ s:{x:15,y:50}, e:{x:30,y:50}, n: "r", t: w==="bold"?6:3 }},
            { t:"l", o:"a", p:{ s:{x:70,y:50}, e:{x:85,y:50}, n: "r", t: w==="bold"?6:3 }}
          ]
        }),
        
        plus: (w) => ({
          ct: [
            { t:"l", o:"a", p:{ s:{x:50,y:20}, e:{x:50,y:80}, n: "r", t: w==="bold"?6:3 }},
            { t:"l", o:"a", p:{ s:{x:20,y:50}, e:{x:80,y:50}, n: "r", t: w==="bold"?6:3 }}
          ]
        }),
        
        minus: (w) => ({
          ct: [
            { t:"l", o:"a", p:{ s:{x:20,y:50}, e:{x:80,y:50},  n: "r", t: w==="bold"?6:3 }}
          ]
        }),
        
        check: (w) => ({
          ct: [
            { t:"l", o:"a", p:{ s:{x:20,y:55}, e:{x:40,y:75}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:40,y:75}, e:{x:80,y:30}, n: "r", t: w==="bold"?6:3  }}
          ]
        }),
        
        close: (w) => ({
          ct: [
            { t:"l", o:"a", p:{ s:{x:25,y:25}, e:{x:75,y:75}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:75,y:25}, e:{x:25,y:75}, n: "r", t: w==="bold"?6:3  }}
          ]
        }),
        
        arrowright: (w) => ({
          ct: [
            { t:"l", o:"a", p:{ s:{x:20,y:50}, e:{x:70,y:50}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:55,y:35}, e:{x:70,y:50}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:55,y:65}, e:{x:70,y:50}, n: "r", t: w==="bold"?6:3  }}
          ]
        }),
        
        arrowleft: (w) => ({
          ct: [
            { t:"l", o:"a", p:{ s:{x:80,y:50}, e:{x:30,y:50}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:45,y:35}, e:{x:30,y:50}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:45,y:65}, e:{x:30,y:50}, n: "r", t: w==="bold"?6:3  }}
          ]
        }),
        
        arrowup: (w) => ({
          ct: [
            { t:"l", o:"a", p:{ s:{x:50,y:80}, e:{x:50,y:30}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:35,y:45}, e:{x:50,y:30}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:65,y:45}, e:{x:50,y:30}, n: "r", t: w==="bold"?6:3  }}
          ]
        }),
        
        arrowdown: (w) => ({
          ct: [
            { t:"l", o:"a", p:{ s:{x:50,y:20}, e:{x:50,y:70}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:35,y:55}, e:{x:50,y:70}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:65,y:55}, e:{x:50,y:70}, n: "r", t: w==="bold"?6:3  }}
          ]
        }),
        
        bell: (w) => ({
          ct: [
            { t:"h", o:"a", p:{ t:"circle", center:{x:50,y:75}, radius:5, outline: w==="bold"?0:3 }},
            { t:"l", o:"a", p:{ s:{x:35,y:65}, e:{x:65,y:65}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:60,y:35}, e:{x:40,y:35}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:35,y:65}, e:{x:40,y:35}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:65,y:65}, e:{x:60,y:35}, n: "r", t: w==="bold"?6:3  }}
          ]
        }),
        
        heart: (w) => 
          ({ct:[ {
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":51,"y":84},
                "e": {"x":21,"y":26},
                "c": {"x":7,"y":36},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":51,"y":84},
                "e": {"x":78,"y":25},
                "c": {"x":94,"y":34},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":50,"y":30},
                "e": {"x":19,"y":29},
                "c": {"x":27,"y":14},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":50,"y":30},
                "e": {"x":80,"y":27},
                "c": {"x":69,"y":14},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            }]}),
        
        lock: (w) => ({
          ct: [
              { t: "l", o: "a", p: { s: { x: 30, y: 45 }, e: { x: 70, y: 45 }, n: "r", t: w === "bold" ? 6 : 3 }},
              { t: "l", o: "a", p: { s: { x: 30, y: 45 }, e: { x: 30, y: 80 },  n: "r", t: w === "bold" ? 6 : 3 }},
              { t: "l", o: "a", p: { s: { x: 70, y: 45 }, e: { x: 70, y: 80 }, n: "r", t: w === "bold" ? 6 : 3 }},
              { t: "l", o: "a", p: { s: { x: 30, y: 80 }, e: { x: 70, y: 80 }, n: "r", t: w === "bold" ? 6 : 3 }},
              { t: "h", o: "a", p: { t: "circle", center: { x: 50, y: 60 }, radius: 6, outline: 0 }},
              { t: "l", o: "a", p: { s: { x: 50, y: 63 }, e: { x: 50, y: 72 }, t: w === "bold" ? 5 : 3, n: "r" }},
              { t: "l", o: "a", p: { s: { x: 35, y: 43 }, e: { x: 50, y: 22 }, c: { x: 32, y: 22 }, t: w === "bold" ? 5 : 3, n: "r" }},
              { t: "l", o: "a", p: { s: { x: 50, y: 22 }, e: { x: 65, y: 43 }, c: { x: 68, y: 22 }, t: w === "bold" ? 5 : 3, n: "r" }}
          ]
        }),
        
        unlock: (w) => ({
          ct: [
            { t:"h", o:"a", p:{ t:"circle", center:{x:50,y:50}, radius:15, outline:3 }},
            { t:"l", o:"a", p:{ s:{x:35,y:35}, e:{x:35,y:50}, n: "r", t: w==="bold"?6:3  }}
          ]
        }),
        
        trash: (w) => ({
          ct: [
            { t:"l", o:"a", p:{ s:{x:30,y:30}, e:{x:70,y:30}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:35,y:30}, e:{x:35,y:75}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:65,y:30}, e:{x:65,y:75}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:35,y:78}, e:{x:65,y:78}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:45,y:70}, e:{x:55,y:70}, n: "r", t: w==="bold"?6:3  }}
          ]
        }),
        
        download: (w) => ({
          ct: [
            { t:"l", o:"a", p:{ s:{x:50,y:20}, e:{x:50,y:60}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:35,y:45}, e:{x:50,y:60}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:65,y:45}, e:{x:50,y:60}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:30,y:75}, e:{x:70,y:75}, n: "r", t: w==="bold"?6:3  }}
          ]
        }),
        zoomout: (w) => ({
          ct:[ {
            "t": "h",
            "o": "a",
            "p": {
              "t": "circle",
              "center": {"x":40,"y":41},
              "radius": 20,
              "n": "r",
              "outline": w === "bold" ? 6 : 3
            }
          },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":54,"y":55},
                "e": {"x":71,"y":72},
                "c": {"x":54,"y":55},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":30,"y":41},
                "e": {"x":50,"y":41},
                "c": {"x":40,"y":41},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":55,"y":54},
                "e": {"x":72,"y":71},
                "c": {"x":50,"y":50},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            }]}),
        upload: (w) => ({
          ct: [
            { t:"l", o:"a", p:{ s:{x:50,y:80}, e:{x:50,y:40}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:35,y:55}, e:{x:50,y:40}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:65,y:55}, e:{x:50,y:40}, n: "r", t: w==="bold"?6:3  }},
            { t:"l", o:"a", p:{ s:{x:30,y:25}, e:{x:70,y:25}, n: "r", t: w==="bold"?6:3  }}
          ]
        }),      
        bookmark: (w) =>({
          ct: [
            { t:"l", o:"a", p:{ s:{x:29,y:12}, e:{x:29,y:75}, n:"r", t: w==="bold"?6:3 }},
            { t:"l", o:"a", p:{ s:{x:29,y:12}, e:{x:69,y:12}, n:"r", t: w==="bold"?6:3 }},
            { t:"l", o:"a", p:{ s:{x:69,y:12}, e:{x:70,y:75}, n:"r", t: w==="bold"?6:3 }},
            { t:"l", o:"a", p:{ s:{x:29,y:75}, e:{x:51,y:85}, n:"r", t: w==="bold"?6:3 }},
            { t:"l", o:"a", p:{ s:{x:51,y:85}, e:{x:70,y:75}, n:"r", t: w==="bold"?6:3 }},
            { t:"l", o:"a", p:{ s:{x:37,y:49}, e:{x:47,y:59}, n:"r", t: w==="bold"?6:3 }},
            { t:"l", o:"a", p:{ s:{x:47,y:59}, e:{x:64,y:39}, n:"r", t: w==="bold"?6:3 }}
          ]
          
        }),
        play: (w) =>({
          ct: [
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 20,
                  "y": 17
                },
                "e": {
                  "x": 85,
                  "y": 52
                },
                "c": {
                  "x": 53,
                  "y": 35
                },
                n:"r",
                t: w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 20,
                  "y": 84
                },
                "e": {
                  "x": 85,
                  "y": 52
                },
                "c": {
                  "x": 51,
                  "y": 69
                },
                n:"r",
                t: w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 20,
                  "y": 84
                },
                "e": {
                  "x": 20,
                  "y": 17
                },
                "c": {
                  "x": 20,
                  "y": 50
                },
                n:"r",
                t: w==="bold"?6:3 
              }
            }
          ]
        }), 
        pause: (w) =>({
          ct: [
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 28,
                  "y": 85
                },
                "e": {
                  "x": 28,
                  "y": 16
                },
                "c": {
                  "x": 28,
                  "y": 45
                },
                "n": "r",
                "t": w==="bold"?9:4
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 70,
                  "y": 17
                },
                "e": {
                  "x": 70,
                  "y": 84
                },
                "c": {
                  "x": 70,
                  "y": 52
                },
                "n": "r",
                "t": w==="bold"?9:4
              }
            }
          ]
        }), 
        filter: (w) =>({
          ct: [
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 16,
                  "y": 30
                },
                "e": {
                  "x": 85,
                  "y": 30
                },
                "c": {
                  "x": 54,
                  "y": 30
                },
                "n": "r",
                "t": w==="bold"?9:4
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 29,
                  "y": 51
                },
                "e": {
                  "x": 75,
                  "y": 51
                },
                "c": {
                  "x": 52,
                  "y": 51
                },
                "n": "r",
                "t": w==="bold"?9:4
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 37,
                  "y": 69
                },
                "e": {
                  "x": 64,
                  "y": 69
                },
                "c": {
                  "x": 51,
                  "y": 69
                },
                "n": "r",
                "t": w==="bold"?9:4
              }
            }
          ]
        }), 
        list: (w) =>({
          ct: [
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 31,
                  "y": 69
                },
                "e": {
                  "x": 85,
                  "y": 69
                },
                "c": {
                  "x": 58,
                  "y": 69
                },
                "n": "r",
                "t": w==="bold"?9:4
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 31,
                  "y": 49
                },
                "e": {
                  "x": 85,
                  "y": 49
                },
                "c": {
                  "x": 58,
                  "y": 49
                },
                "n": "r",
                "t": w==="bold"?9:4
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 31,
                  "y": 31
                },
                "e": {
                  "x": 84,
                  "y": 31
                },
                "c": {
                  "x": 61,
                  "y": 31
                },
                "n": "r",
              "t": w==="bold"?9:4
              }
            },
            {
              "t": "h",
              "o": "a",
              "p": {
                "t": "circle",
                "center": {
                  "x": 19,
                  "y": 30
                },
                "radius": 2,
                "n": "r",
                "outline": w==="bold"?9:4
              }
            },
            {
              "t": "h",
              "o": "a",
              "p": {
                "t": "circle",
                "center": {
                  "x": 19,
                  "y": 49
                },
                "radius": 2,
                "n": "r",
                "outline": w==="bold"?9:4
              }
            },
            {
              "t": "h",
              "o": "a",
              "p": {
                "t": "circle",
                "center": {
                  "x": 19,
                  "y": 69
                },
                "radius": 2,
                "n": "r",
                "outline": w==="bold"?9:4
              }
            }
          ]
        }),
        wifi: (w) =>({
          ct: [
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 16,
                  "y": 28
                },
                "e": {
                  "x": 84,
                  "y": 28
                },
                "c": {
                  "x": 52,
                  "y": 10
                },
                "n": "r",
                "t": w==="bold"?6:3
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 26,
                  "y": 46
                },
                "e": {
                  "x": 75,
                  "y": 47
                },
                "c": {
                  "x": 52,
                  "y": 32
                },
                "n": "r",
                "t": w==="bold"?6:3
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 38,
                  "y": 61
                },
                "e": {
                  "x": 62,
                  "y": 61
                },
                "c": {
                  "x": 51,
                  "y": 53
                },
                "n": "r",
                "t": w==="bold"?6:3
              }
            },
            {
              "t": "h",
              "o": "a",
              "p": {
                "t": "circle",
                "center": {
                  "x": 51,
                  "y": 75
                },
                "radius": 2,
                "n": "r",
                "outline": w==="bold"?6:3
              }
            }
          ]
        }), 
        pin: (w) =>({
          ct: [
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 50,
                  "y": 84
                },
                "e": {
                  "x": 50,
                  "y": 38
                },
                "c": {
                  "x": 50,
                  "y": 50
                },
                "n": "r",
                "t": w==="bold"?9:5
              }
            },
            {
              "t": "h",
              "o": "a",
              "p": {
                "t": "circle",
                "center": {
                  "x": 50,
                  "y": 27
                },
                "radius": 11,
                "n": "r",
                "outline": w==="bold"?9:4
              }
            }
          ]
        }),
        compass: (w) =>({
          ct: [
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 29,
                  "y": 50
                },
                "e": {
                  "x": 73,
                  "y": 51
                },
                "c": {
                  "x": 50,
                  "y": 50
                },
                "n": "r",
                "t": w==="bold"?6:3
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 50,
                  "y": 16
                },
                "e": {
                  "x": 50,
                  "y": 85
                },
                "c": {
                  "x": 50,
                  "y": 43
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 62,
                  "y": 28
                },
                "e": {
                  "x": 50,
                  "y": 16
                },
                "c": {
                  "x": 53,
                  "y": 19
                },
                "n": "r",
                "t": w==="bold"?6:3
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 40,
                  "y": 28
                },
                "e": {
                  "x": 50,
                  "y": 16
                },
                "c": {
                  "x": 47,
                  "y": 20
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            }
          ]
        }), 
        laptop: (w) =>({
          ct: [
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 19,
                  "y": 22
                },
                "e": {
                  "x": 81,
                  "y": 22
                },
                "c": {
                  "x": 49,
                  "y": 22
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 19,
                  "y": 63
                },
                "e": {
                  "x": 81,
                  "y": 63
                },
                "c": {
                  "x": 52,
                  "y": 63
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 19,
                  "y": 22
                },
                "e": {
                  "x": 19,
                  "y": 63
                },
                "c": {
                  "x": 19,
                  "y": 45
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 81,
                  "y": 22
                },
                "e": {
                  "x": 81,
                  "y": 63
                },
                "c": {
                  "x": 81,
                  "y": 36
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 14,
                  "y": 72
                },
                "e": {
                  "x": 86,
                  "y": 72
                },
                "c": {
                  "x": 51,
                  "y": 72
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            }
          ]
        }), 
        tag:(w) =>({
          ct: [
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 43,
                  "y": 20
                },
                "e": {
                  "x": 81,
                  "y": 60
                },
                "c": {
                  "x": 61,
                  "y": 39
                },
                "n": "r",
                "t": w==="bold"?6:3
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 20,
                  "y": 42
                },
                "e": {
                  "x": 59,
                  "y": 82
                },
                "c": {
                  "x": 39,
                  "y": 62
                },
                "n": "r",
                "t": w==="bold"?6:3
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 20,
                  "y": 42
                },
                "e": {
                  "x": 21,
                  "y": 21
                },
                "c": {
                  "x": 20,
                  "y": 30
                },
                "n": "r",
                "t": w==="bold"?6:3
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 21,
                  "y": 21
                },
                "e": {
                  "x": 43,
                  "y": 20
                },
                "c": {
                  "x": 32,
                  "y": 20
                },
                "n": "r",
                "t": w==="bold"?6:3
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 59,
                  "y": 82
                },
                "e": {
                  "x": 81,
                  "y": 60
                },
                "c": {
                  "x": 70,
                  "y": 71
                },
                "n": "r",
                "t": w==="bold"?6:3
              }
            },
            {
              "t": "h",
              "o": "a",
              "p": {
                "t": "circle",
                "center": {
                  "x": 30,
                  "y": 30
                },
                "radius": 3,
                "n": "r",
                "outline": w==="bold"?6:3
              }
            }
          ]
        }), 
        battery: (w) =>({
          ct: [
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 16,
                  "y": 63
                },
                "e": {
                  "x": 79,
                  "y": 63
                },
                "c": {
                  "x": 52,
                  "y": 63
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 16,
                  "y": 35
                },
                "e": {
                  "x": 79,
                  "y": 35
                },
                "c": {
                  "x": 49,
                  "y": 35
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 16,
                  "y": 35
                },
                "e": {
                  "x": 16,
                  "y": 63
                },
                "c": {
                  "x": 16,
                  "y": 52
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 79,
                  "y": 35
                },
                "e": {
                  "x": 79,
                  "y": 63
                },
                "c": {
                  "x": 79,
                  "y": 50
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 81,
                  "y": 45
                },
                "e": {
                  "x": 81,
                  "y": 54
                },
                "c": {
                  "x": 81,
                  "y": 50
                },
                "n": "r",
                "t": w==="bold"?10:3 
              }
            }
          ]
        }), 
        batteryLow: (w) =>({
          ct: [
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 16,
                  "y": 63
                },
                "e": {
                  "x": 79,
                  "y": 63
                },
                "c": {
                  "x": 52,
                  "y": 63
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 16,
                  "y": 35
                },
                "e": {
                  "x": 79,
                  "y": 35
                },
                "c": {
                  "x": 49,
                  "y": 35
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 16,
                  "y": 35
                },
                "e": {
                  "x": 16,
                  "y": 63
                },
                "c": {
                  "x": 16,
                  "y": 52
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 79,
                  "y": 35
                },
                "e": {
                  "x": 79,
                  "y": 63
                },
                "c": {
                  "x": 79,
                  "y": 50
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 81,
                  "y": 45
                },
                "e": {
                  "x": 81,
                  "y": 54
                },
                "c": {
                  "x": 81,
                  "y": 50
                },
                "n": "r",
                "t": w==="bold"?10:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 25,
                  "y": 43
                },
                "e": {
                  "x": 25,
                  "y": 55
                },
                "c": {
                  "x": 25,
                  "y": 59
                },
                "n": "r",
                "t": w==="bold"?6:6
              }
            }
          ]
        }),
        charging: (w) =>({
          ct: [
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 16,
                  "y": 63
                },
                "e": {
                  "x": 79,
                  "y": 63
                },
                "c": {
                  "x": 52,
                  "y": 63
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 16,
                  "y": 35
                },
                "e": {
                  "x": 79,
                  "y": 35
                },
                "c": {
                  "x": 49,
                  "y": 35
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 16,
                  "y": 35
                },
                "e": {
                  "x": 16,
                  "y": 63
                },
                "c": {
                  "x": 16,
                  "y": 52
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 79,
                  "y": 35
                },
                "e": {
                  "x": 79,
                  "y": 63
                },
                "c": {
                  "x": 79,
                  "y": 50
                },
                "n": "r",
                "t": w==="bold"?6:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 81,
                  "y": 45
                },
                "e": {
                  "x": 81,
                  "y": 54
                },
                "c": {
                  "x": 81,
                  "y": 50
                },
                "n": "r",
                "t": w==="bold"?10:3 
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                "x": 56,
                "y": 42
              },
              "e": {
                "x": 46,
                "y": 52
              },
              "c": {
                "x": 50,
                "y": 48
              },
                "n": "r",
                "t": 6
              }
            },
            {
              "t": "l",
              "o": "a",
              "p": {
                "s": {
                  "x": 44,
                  "y": 58
                },
                "e": {
                  "x": 54,
                  "y": 48
                },
                "c": {
                  "x": 48,
                  "y": 54
                },
                "n": "r",
                "t": 6
              }
            }
          ]
        }),
        logout: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":80}, "e": {"x":16,"y":22}, "c": {"x":16,"y":51}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":80}, "e": {"x":73,"y":80}, "c": {"x":47,"y":79}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":22}, "e": {"x":72,"y":22}, "c": {"x":48,"y":22}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":72,"y":22}, "e": {"x":72,"y":39}, "c": {"x":72,"y":30}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":73,"y":63}, "e": {"x":73,"y":80}, "c": {"x":73,"y":72}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":36,"y":52}, "e": {"x":87,"y":52}, "c": {"x":54,"y":52}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":79,"y":40}, "e": {"x":87,"y":52}, "c": {"x":83,"y":45}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":79,"y":61}, "e": {"x":87,"y":52}, "c": {"x":82,"y":58}, "n": "r", "t": w === "bold" ? 6 : 3 } }] }),
        reply: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":21,"y":80}, "e": {"x":67,"y":56}, "c": {"x":40,"y":54}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":21,"y":80}, "e": {"x":67,"y":38}, "c": {"x":35,"y":36}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":85,"y":47}, "e": {"x":68,"y":65}, "c": {"x":77,"y":51}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":68,"y":30}, "e": {"x":85,"y":47}, "c": {"x":76,"y":39}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":67,"y":30}, "e": {"x":67,"y":38}, "c": {"x":67,"y":34}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":67,"y":56}, "e": {"x":67,"y":65}, "c": {"x":67,"y":61}, "n": "r", "t": w === "bold" ? 6 : 3 } }] }),
        // forward: (w) => 
        //   ({ "ct":[{ "t": "h", "o": "a", "p": { "t": "circle", "center": undefined, "radius": undefined, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": undefined, "radius": undefined, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":24,"y":60}, "e": {"x":15,"y":50}, "c": {"x":15,"y":60}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":15,"y":50}, "e": {"x":23,"y":42}, "c": {"x":15,"y":42}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":64,"y":53}, "e": {"x":74,"y":60}, "c": {"x":64,"y":53}, "n": "r", "t": w === "bold" ? 6 : 3 } }] }),
        drop: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":17,"y":39}, "e": {"x":49,"y":70}, "c": {"x":30,"y":51}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":49,"y":70}, "e": {"x":84,"y":40}, "c": {"x":62,"y":58}, "n": "r", "t": w === "bold" ? 6 : 3 } }] }),
        growth: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":72}, "e": {"x":71,"y":31}, "c": {"x":55,"y":78}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":71,"y":31}, "e": {"x":62,"y":34}, "c": {"x":66,"y":33}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":78}, "e": {"x":81,"y":79}, "c": {"x":50,"y":79}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":80,"y":34}, "e": {"x":81,"y":79}, "c": {"x":80,"y":52}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":71,"y":43}, "e": {"x":70,"y":79}, "c": {"x":71,"y":57}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":62,"y":57}, "e": {"x":62,"y":79}, "c": {"x":62,"y":69}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":53,"y":79}, "e": {"x":53,"y":68}, "c": {"x":53,"y":74}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":44,"y":73}, "e": {"x":44,"y":78}, "c": {"x":44,"y":78}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":35,"y":79}, "e": {"x":35,"y":74}, "c": {"x":35,"y":79}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":20,"y":77}, "e": {"x":29,"y":77}, "c": {"x":24,"y":77}, "n": "r", "t": w === "bold" ? 6 : 3 } }] }),
        desktop: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":18,"y":81}, "e": {"x":83,"y":81}, "c": {"x":50,"y":81}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":21,"y":67}, "e": {"x":41,"y":67}, "c": {"x":32,"y":67}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":58,"y":67}, "e": {"x":76,"y":67}, "c": {"x":67,"y":67}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":21,"y":29}, "e": {"x":21,"y":67}, "c": {"x":21,"y":49}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":21,"y":29}, "e": {"x":76,"y":29}, "c": {"x":49,"y":29}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":76,"y":29}, "e": {"x":76,"y":67}, "c": {"x":76,"y":47}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":44,"y":81}, "e": {"x":44,"y":60}, "c": {"x":44,"y":60}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":49,"y":60}, "e": {"x":49,"y":81}, "c": {"x":49,"y":67}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":54,"y":60}, "e": {"x":54,"y":81}, "c": {"x":54,"y":68}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":18,"y":82}, "e": {"x":83,"y":82}, "c": {"x":50,"y":82}, "n": "r", "t": w === "bold" ? 6 : 3 } }] }),
        uploadfile: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":27,"y":80}, "e": {"x":72,"y":80}, "c": {"x":49,"y":80}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":27,"y":80}, "e": {"x":28,"y":24}, "c": {"x":27,"y":50}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":72,"y":36}, "e": {"x":72,"y":80}, "c": {"x":72,"y":49}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":64,"y":24}, "e": {"x":71,"y":36}, "c": {"x":72,"y":36}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":49,"y":51}, "e": {"x":49,"y":14}, "c": {"x":49,"y":51}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":28,"y":24}, "e": {"x":44,"y":24}, "c": {"x":37,"y":24}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":53,"y":23}, "e": {"x":64,"y":24}, "c": {"x":57,"y":23}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":49,"y":14}, "e": {"x":54,"y":19}, "c": {"x":53,"y":18}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":49,"y":14}, "e": {"x":43,"y":19}, "c": {"x":45,"y":17}, "n": "r", "t": w === "bold" ? 6 : 3 } }] }),
        eyeShow: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":46}, "e": {"x":84,"y":47}, "c": {"x":51,"y":12}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":46}, "e": {"x":84,"y":47}, "c": {"x":49,"y":81}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":50,"y":47}, "radius": 10, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":47,"y":37}, "e": {"x":84,"y":47}, "c": {"x":55,"y":36}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":46}, "e": {"x":51,"y":57}, "c": {"x":43,"y":59}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":50,"y":47}, "radius": 3, "n": "r", "outline": w === "bold" ? 6 : 3 } }] }),
        eyehide: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":46}, "e": {"x":84,"y":47}, "c": {"x":51,"y":12}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":46}, "e": {"x":84,"y":47}, "c": {"x":49,"y":81}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":50,"y":47}, "radius": 10, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":47,"y":37}, "e": {"x":84,"y":47}, "c": {"x":55,"y":36}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":46}, "e": {"x":51,"y":57}, "c": {"x":43,"y":59}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":50,"y":47}, "radius": 3, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":30,"y":27}, "e": {"x":68,"y":71}, "c": {"x":50,"y":50}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":32,"y":25}, "e": {"x":70,"y":70}, "c": {"x":51,"y":48}, "n": "r", "t": w === "bold" ? 6 : 3 } }] }),
        Shield: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":27,"y":63}, "e": {"x":49,"y":83}, "c": {"x":29,"y":77}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":49,"y":83}, "e": {"x":73,"y":63}, "c": {"x":69,"y":79}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":73,"y":32}, "e": {"x":73,"y":63}, "c": {"x":73,"y":46}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":27,"y":63}, "e": {"x":27,"y":32}, "c": {"x":27,"y":47}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":27,"y":32}, "e": {"x":52,"y":24}, "c": {"x":42,"y":31}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":52,"y":24}, "e": {"x":73,"y":32}, "c": {"x":58,"y":30}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":73,"y":32}, "e": {"x":49,"y":83}, "c": {"x":20,"y":64}, "n": "r", "t": w === "bold" ? 6 : 3 } }] }),
        privacy: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":27,"y":63}, "e": {"x":49,"y":83}, "c": {"x":29,"y":77}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":49,"y":83}, "e": {"x":73,"y":63}, "c": {"x":69,"y":79}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":73,"y":32}, "e": {"x":73,"y":63}, "c": {"x":73,"y":46}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":27,"y":63}, "e": {"x":27,"y":32}, "c": {"x":27,"y":47}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":27,"y":32}, "e": {"x":52,"y":24}, "c": {"x":42,"y":31}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":52,"y":24}, "e": {"x":73,"y":32}, "c": {"x":58,"y":30}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":67,"y":65}, "e": {"x":32,"y":66}, "c": {"x":50,"y":48}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":50,"y":42}, "radius": 8, "n": "r", "outline": w === "bold" ? 6 : 3 } }] }),
        friends: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":41,"y":66}, "e": {"x":85,"y":66}, "c": {"x":64,"y":48}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":63,"y":37}, "radius": 12, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":65}, "e": {"x":49,"y":61}, "c": {"x":38,"y":47}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":37,"y":42}, "radius": 9, "n": "r", "outline": w === "bold" ? 6 : 3 } }] }),
        flag: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":24,"y":84}, "e": {"x":23,"y":19}, "c": {"x":23,"y":51}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":23,"y":51}, "e": {"x":79,"y":49}, "c": {"x":44,"y":41}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":23,"y":19}, "e": {"x":79,"y":49}, "c": {"x":64,"y":21}, "n": "r", "t": w === "bold" ? 6 : 3 } }] }),
        mail: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":74}, "e": {"x":85,"y":73}, "c": {"x":49,"y":74}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":29}, "e": {"x":85,"y":28}, "c": {"x":53,"y":29}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":74}, "e": {"x":16,"y":29}, "c": {"x":16,"y":50}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":85,"y":28}, "e": {"x":85,"y":73}, "c": {"x":84,"y":49}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":27,"y":38}, "e": {"x":73,"y":36}, "c": {"x":50,"y":60}, "n": "r", "t": w === "bold" ? 6 : 3 } }] }),
        share: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":28,"y":20}, "e": {"x":71,"y":51}, "c": {"x":49,"y":36}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":25,"y":77}, "e": {"x":71,"y":55}, "c": {"x":50,"y":65}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":74,"y":53}, "radius": 3, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":25,"y":19}, "radius": 3, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":22,"y":79}, "radius": 3, "n": "r", "outline": w === "bold" ? 6 : 3 } }] }),
        call: (w) => 
          ({ "ct":[{ "t": "l", "o": "a", "p": { "s": {"x":82,"y":29}, "e": {"x":34,"y":80}, "c": {"x":72,"y":67}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":37,"y":67}, "e": {"x":66,"y":36}, "c": {"x":61,"y":57}, "n": "r", "t": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":72,"y":27}, "radius": 10, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":27,"y":72}, "radius": 10, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":72,"y":27}, "radius": 8, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":27,"y":72}, "radius": 8, "n": "r", "outline": w ===  "bold" ? 6 : 3 } }] }),
        star: (w) => 
          ({ "ct":[{"t": "l", "o": "a", "p": { "s": {"x":61,"y":38}, "e": {"x":84,"y":38}, "c": {"x":84,"y":38}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":39,"y":38}, "e": {"x":51,"y":14}, "c": {"x":41,"y":33}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":66,"y":50}, "e": {"x":75,"y":79}, "c": {"x":66,"y":52}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":66,"y":52}, "e": {"x":84,"y":38}, "c": {"x":66,"y":52}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":49,"y":60}, "e": {"x":75,"y":79}, "c": {"x":49,"y":60}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":22,"y":78}, "e": {"x":49,"y":60}, "c": {"x":39,"y":66}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":51,"y":14}, "e": {"x":61,"y":38}, "c": {"x":55,"y":25}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":22,"y":78}, "e": {"x":33,"y":51}, "c": {"x":30,"y":59}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":33,"y":51}, "e": {"x":16,"y":38}, "c": {"x":23,"y":44}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":16,"y":38}, "e": {"x":39,"y":38}, "c": {"x":27,"y":38}, "n": "r", "t": w ===  "bold" ? 6 : 3 } }] }),
        info: (w) => 
          ({ "ct":[{"t": "h", "o": "a", "p": { "t": "circle", "center": {"x":50,"y":49}, "radius": 33, "n": "r", "outline": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":51,"y":65}, "e": {"x":49,"y":23}, "c": {"x":50,"y":49}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":52,"y":65}, "e": {"x":50,"y":23}, "c": {"x":51,"y":50}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":50,"y":65}, "e": {"x":48,"y":23}, "c": {"x":49,"y":50}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":51,"y":73}, "radius": 2, "n": "r", "outline": w ===  "bold" ? 6 : 3 } }] }),
        key: (w) => 
          ({ "ct":[{"t": "h", "o": "a", "p": { "t": "circle", "center": {"x":49,"y":26}, "radius": 12, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":49,"y":26}, "radius": 10, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "l", "o": "a", "p": { "s": {"x":41,"y":36}, "e": {"x":43,"y":81}, "c": {"x":41,"y":36}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":43,"y":81}, "e": {"x":50,"y":85}, "c": {"x":50,"y":85}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":50,"y":85}, "e": {"x":55,"y":82}, "c": {"x":55,"y":82}, "n": "r", "t": w === "bold" ? 6 : 3 }, "t": "l", "o": "a", "p": { "s": {"x":57,"y":35}, "e": {"x":57,"y":42}, "c": {"x":57,"y":42}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":57,"y":42}, "e": {"x":50,"y":50}, "c": {"x":57,"y":42}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":54,"y":44}, "e": {"x":55,"y":82}, "c": {"x":54,"y":44}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":47,"y":83}, "e": {"x":45,"y":43}, "c": {"x":45,"y":43}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":47,"y":83}, "e": {"x":45,"y":43}, "c": {"x":45,"y":43}, "n": "r", "t": w === "bold" ? 6 : 3 }, "t": "l", "o": "a", "p": { "s": {"x":52,"y":54}, "e": {"x":53,"y":78}, "c": {"x":52,"y":54}, "n": "r", "t": w ===  "bold" ? 6 : 3 } }] }),
        location: (w) => 
          ({ "ct":[{"t": "h", "o": "a", "p": { "t": "circle", "center": {"x":48,"y":33}, "radius": 18, "n": "r", "outline": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":46,"y":85}, "e": {"x":29,"y":33}, "c": {"x":33,"y":51}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":46,"y":85}, "e": {"x":66,"y":36}, "c": {"x":56,"y":61}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":48,"y":33}, "radius": 6, "n": "r", "outline": w ===  "bold" ? 6 : 3 } }] }),
        bluetooth: (w) => 
          ({ "ct":[{"t": "l", "o": "a", "p": { "s": {"x":40,"y":83}, "e": {"x":40,"y":17}, "c": {"x":40,"y":50}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":61,"y":33}, "e": {"x":21,"y":68}, "c": {"x":40,"y":50}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":40,"y":83}, "e": {"x":60,"y":68}, "c": {"x":40,"y":83}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":22,"y":32}, "e": {"x":60,"y":68}, "c": {"x":40,"y":50}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":40,"y":17}, "e": {"x":61,"y":33}, "c": {"x":61,"y":33}, "n": "r", "t": w ===  "bold" ? 6 : 3 } }] }),
        chat: (w) => 
          ({ "ct":[{"t": "l", "o": "a", "p": { "s": {"x":29,"y":65}, "e": {"x":20,"y":71}, "c": {"x":26,"y":69}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":50,"y":47}, "radius": 27, "n": "r", "outline": w === "bold" ? 6 : 3 }},{"t": "l", "o": "a", "p": { "s": {"x":20,"y":71}, "e": {"x":38,"y":71}, "c": {"x":28,"y":75}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":38,"y":47}, "radius": 3, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":50,"y":47}, "radius": 3, "n": "r", "outline": w === "bold" ? 6 : 3 } },{ "t": "h", "o": "a", "p": { "t": "circle", "center": {"x":62,"y":48}, "radius": 3, "n": "r", "outline": w === "bold" ? 6 : 3 } }] }),
        microphone: (w) => 
          ({ "ct":[{"t": "l", "o": "a", "p": { "s": {"x":32,"y":22}, "e": {"x":32,"y":66}, "c": {"x":32,"y":66}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":36,"y":21}, "e": {"x":36,"y":62}, "c": {"x":36,"y":21}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":63,"y":22}, "e": {"x":63,"y":65}, "c": {"x":63,"y":22}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":58,"y":20}, "e": {"x":58,"y":61}, "c": {"x":58,"y":20}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":47,"y":75}, "e": {"x":47,"y":85}, "c": {"x":47,"y":75}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":36,"y":22}, "e": {"x":46,"y":13}, "c": {"x":36,"y":12}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":58,"y":61}, "e": {"x":47,"y":69}, "c": {"x":58,"y":68}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":32,"y":64}, "e": {"x":47,"y":75}, "c": {"x":32,"y":75}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":63,"y":63}, "e": {"x":47,"y":75}, "c": {"x":61,"y":75}, "n": "r", "t": w ===  "bold" ? 6 : 3 } }] }),
        attachment: (w) => 
          ({ "ct":[{"t": "l", "o": "a", "p": { "s": {"x":28,"y":81}, "e": {"x":28,"y":20}, "c": {"x":28,"y":81}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":70,"y":29}, "e": {"x":69,"y":82}, "c": {"x":70,"y":29}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":28,"y":81}, "e": {"x":69,"y":82}, "c": {"x":28,"y":81}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":61,"y":20}, "e": {"x":70,"y":29}, "c": {"x":61,"y":20}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":28,"y":20}, "e": {"x":61,"y":20}, "c": {"x":61,"y":20}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":44,"y":56}, "e": {"x":59,"y":44}, "c": {"x":44,"y":56}, "n": "r", "t": w === "bold" ? 6 : 3 }, "t": "l", "o": "a", "p": { "s": {"x":44,"y":49}, "e": {"x":36,"y":56}, "c": {"x":36,"y":56}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":51,"y":56}, "e": {"x":44,"y":63}, "c": {"x":51,"y":56}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":38,"y":54}, "e": {"x":36,"y":63}, "c": {"x":33,"y":60}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":45,"y":62}, "e": {"x":36,"y":63}, "c": {"x":40,"y":67}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":50,"y":44}, "e": {"x":57,"y":38}, "c": {"x":50,"y":44}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":58,"y":51}, "e": {"x":66,"y":44}, "c": {"x":66,"y":44}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":65,"y":37}, "e": {"x":56,"y":39}, "c": {"x":61,"y":33}, "n": "r", "t": w === "bold" ? 6 : 3 }},{ "t": "l", "o": "a", "p": { "s": {"x":65,"y":37}, "e": {"x":65,"y":45}, "c": {"x":69,"y":40}, "n": "r", "t": w ===  "bold" ? 6 : 3 } }] }),
        checklist: (w) => 
          ({ct:[ {
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":32,"y":70},
                "e": {"x":84,"y":69},
                "c": {"x":84,"y":69},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":31,"y":50},
                "e": {"x":83,"y":49},
                "c": {"x":83,"y":49},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":31,"y":31},
                "e": {"x":84,"y":31},
                "c": {"x":84,"y":31},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":24,"y":73},
                "e": {"x":32,"y":65},
                "c": {"x":32,"y":65},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":23,"y":54},
                "e": {"x":31,"y":45},
                "c": {"x":31,"y":45},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":24,"y":35},
                "e": {"x":31,"y":26},
                "c": {"x":31,"y":26},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":21,"y":69},
                "e": {"x":24,"y":73},
                "c": {"x":24,"y":73},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":20,"y":50},
                "e": {"x":23,"y":54},
                "c": {"x":23,"y":54},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":21,"y":31},
                "e": {"x":24,"y":35},
                "c": {"x":24,"y":35},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            }]}),
        x: (w) => 
          ({ct:[ {
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":78,"y":82},
                "e": {"x":27,"y":16},
                "c": {"x":78,"y":82},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":21,"y":18},
                "e": {"x":73,"y":83},
                "c": {"x":73,"y":83},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":23,"y":83},
                "e": {"x":47,"y":52},
                "c": {"x":47,"y":52},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":52,"y":48},
                "e": {"x":74,"y":17},
                "c": {"x":52,"y":48},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            }]}),
        facebook: (w) => 
          ({ct:[ {
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":36,"y":84},
                "e": {"x":34,"y":16},
                "c": {"x":36,"y":84},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":34,"y":16},
                "e": {"x":71,"y":16},
                "c": {"x":71,"y":16},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":40,"y":20},
                "e": {"x":40,"y":44},
                "c": {"x":40,"y":20},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":40,"y":44},
                "e": {"x":67,"y":44},
                "c": {"x":40,"y":44},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":40,"y":20},
                "e": {"x":71,"y":20},
                "c": {"x":40,"y":20},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":40,"y":48},
                "e": {"x":41,"y":84},
                "c": {"x":40,"y":48},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":40,"y":48},
                "e": {"x":67,"y":48},
                "c": {"x":67,"y":48},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            }]}),
        live: (w) => 
          ({ct:[ {
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":55,"y":42},
                "e": {"x":56,"y":54},
                "c": {"x":63,"y":48},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
            "t": "h",
            "o": "a",
            "p": {
              "t": "circle",
              "center": {"x":49,"y":49},
              "radius": 4,
              "n": "r",
              "outline": w === "bold" ? 0: 0
            }
          },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":43,"y":43},
                "e": {"x":43,"y":55},
                "c": {"x":36,"y":50},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":62,"y":37},
                "e": {"x":63,"y":60},
                "c": {"x":74,"y":47},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":71,"y":29},
                "e": {"x":73,"y":65},
                "c": {"x":88,"y":47},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":38,"y":62},
                "e": {"x":36,"y":37},
                "c": {"x":25,"y":51},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":25,"y":31},
                "e": {"x":27,"y":69},
                "c": {"x":9,"y":50},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            }]}),
        image: (w) => 
          ({ct:[ {
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":23,"y":73},
                "e": {"x":85,"y":43},
                "c": {"x":42,"y":40},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":14,"y":51},
                "e": {"x":45,"y":50},
                "c": {"x":29,"y":34},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
            "t": "h",
            "o": "a",
            "p": {
              "t": "circle",
              "center": {"x":48,"y":32},
              "radius": 6,
              "n": "r",
              "outline": w === "bold" ? 6 : 3
            }
          },{
            "t": "h",
            "o": "a",
            "p": {
              "t": "circle",
              "center": {"x":50,"y":50},
              "radius": 36,
              "n": "r",
              "outline": w === "bold" ? 6 : 3
            }
          }]}),
        clock: (w) => 
          ({ct:[ {
            "t": "h",
            "o": "a",
            "p": {
              "t": "circle",
              "center": {"x":50,"y":50},
              "radius": 33,
              "n": "r",
              "outline": w === "bold" ? 6 : 3
            }
          },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":50,"y":17},
                "e": {"x":50,"y":22},
                "c": {"x":50,"y":22},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":49,"y":82},
                "e": {"x":49,"y":75},
                "c": {"x":49,"y":82},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":17,"y":49},
                "e": {"x":22,"y":49},
                "c": {"x":22,"y":49},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":83,"y":50},
                "e": {"x":77,"y":50},
                "c": {"x":83,"y":50},
                "n": "r",
                "t": w === "bold" ? 6 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":50,"y":50},
                "e": {"x":50,"y":28},
                "c": {"x":50,"y":50},
                "n": "r",
                "t": w === "bold" ? 4 : 3
              }
            },{
                "t": "l",
                "o": "a",
                "p": {
                "s": {"x":50,"y":50},
                "e": {"x":60,"y":50},
                "c": {"x":50,"y":50},
                "n": "r",
                "t": w === "bold" ? 4 : 3
              }
            },{
            "t": "h",
            "o": "a",
            "p": {
              "t": "circle",
              "center": {"x":50,"y":50},
              "radius": 29,
              "n": "r",
              "outline": w === "bold" ? 1 : 2
            }
          }]}),
        camera: (w) => 
          ({ct:[ {
            "t": "h",
            "o": "a",
            "p": {
              "t": "circle",
              "center": {"x":50,"y":50},
              "radius": 34,
              "n": "r",
              "outline": w === "bold" ? 6 : 3
            }
          },{
            "t": "h",
            "o": "a",
            "p": {
              "t": "circle",
              "center": {"x":50,"y":50},
              "radius": 15,
              "n": "r",
              "outline": w === "bold" ? 6 : 3
            }
          },{
            "t": "h",
            "o": "a",
            "p": {
              "t": "circle",
              "center": {"x":50,"y":50},
              "radius": 20,
              "n": "r",
              "outline": w === "bold" ? 6 : 3
            }
          },{
            "t": "h",
            "o": "a",
            "p": {
              "t": "circle",
              "center": {"x":67,"y":35},
              "radius": 6,
              "n": "r",
              "outline": w === "bold" ? 6 : 3
            }
          }]}),
          pdf: (w) => 
            ({ct:[ {
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":22,"y":83},
                  "e": {"x":75,"y":83},
                  "c": {"x":22,"y":83},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":75,"y":32},
                  "e": {"x":61,"y":21},
                  "c": {"x":61,"y":21},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":23,"y":20},
                  "e": {"x":61,"y":21},
                  "c": {"x":61,"y":21},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":22,"y":83},
                  "e": {"x":23,"y":20},
                  "c": {"x":23,"y":20},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":75,"y":32},
                  "e": {"x":75,"y":83},
                  "c": {"x":75,"y":32},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":61,"y":21},
                  "e": {"x":61,"y":33},
                  "c": {"x":61,"y":33},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":61,"y":33},
                  "e": {"x":75,"y":32},
                  "c": {"x":75,"y":32},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              }]}),
          showslide: (w) => 
            ({ct:[ {
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":16,"y":76},
                  "e": {"x":84,"y":76},
                  "c": {"x":50,"y":55},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":16,"y":26},
                  "e": {"x":84,"y":27},
                  "c": {"x":50,"y":43},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":33,"y":38},
                  "e": {"x":65,"y":38},
                  "c": {"x":48,"y":43},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":33,"y":62},
                  "e": {"x":65,"y":62},
                  "c": {"x":50,"y":55},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":33,"y":38},
                  "e": {"x":33,"y":62},
                  "c": {"x":33,"y":38},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":65,"y":38},
                  "e": {"x":65,"y":62},
                  "c": {"x":63,"y":48},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":25,"y":36},
                  "e": {"x":25,"y":64},
                  "c": {"x":25,"y":48},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":16,"y":33},
                  "e": {"x":16,"y":68},
                  "c": {"x":16,"y":50},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":16,"y":68},
                  "e": {"x":25,"y":64},
                  "c": {"x":21,"y":65},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":16,"y":33},
                  "e": {"x":25,"y":36},
                  "c": {"x":21,"y":35},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":84,"y":34},
                  "e": {"x":72,"y":37},
                  "c": {"x":79,"y":36},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":72,"y":37},
                  "e": {"x":73,"y":64},
                  "c": {"x":72,"y":37},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":73,"y":64},
                  "e": {"x":84,"y":69},
                  "c": {"x":80,"y":65},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":84,"y":34},
                  "e": {"x":84,"y":69},
                  "c": {"x":84,"y":34},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              }]}),
          edit: (w) => 
            ({ct:[ {
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":33,"y":52},
                  "e": {"x":33,"y":85},
                  "c": {"x":33,"y":85},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":64,"y":51},
                  "e": {"x":65,"y":85},
                  "c": {"x":64,"y":51},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":33,"y":52},
                  "e": {"x":48,"y":21},
                  "c": {"x":48,"y":21},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":48,"y":21},
                  "e": {"x":64,"y":51},
                  "c": {"x":48,"y":21},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":48,"y":16},
                  "e": {"x":48,"y":21},
                  "c": {"x":48,"y":16},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":42,"y":53},
                  "e": {"x":42,"y":84},
                  "c": {"x":42,"y":53},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":54,"y":53},
                  "e": {"x":54,"y":85},
                  "c": {"x":54,"y":53},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              }]}),
          pencil: (w) => 
            ({ct:[ {
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":27,"y":66},
                  "e": {"x":70,"y":18},
                  "c": {"x":70,"y":18},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":36,"y":75},
                  "e": {"x":79,"y":25},
                  "c": {"x":79,"y":25},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":20,"y":80},
                  "e": {"x":27,"y":66},
                  "c": {"x":22,"y":78},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":20,"y":80},
                  "e": {"x":36,"y":75},
                  "c": {"x":22,"y":78},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":70,"y":18},
                  "e": {"x":79,"y":25},
                  "c": {"x":78,"y":17},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":65,"y":24},
                  "e": {"x":74,"y":31},
                  "c": {"x":74,"y":23},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":32,"y":70},
                  "e": {"x":72,"y":25},
                  "c": {"x":50,"y":50},
                  "n": "r",
                  "t": w === "bold" ? 3 : 3
                }
              }]}),
          sidebar: (w) => 
            ({ct:[ {
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":20,"y":78},
                  "e": {"x":80,"y":78},
                  "c": {"x":20,"y":78},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":20,"y":25},
                  "e": {"x":79,"y":26},
                  "c": {"x":79,"y":26},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":20,"y":78},
                  "e": {"x":20,"y":25},
                  "c": {"x":20,"y":78},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":79,"y":26},
                  "e": {"x":80,"y":78},
                  "c": {"x":79,"y":26},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":38,"y":78},
                  "e": {"x":38,"y":26},
                  "c": {"x":38,"y":26},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":23,"y":66},
                  "e": {"x":33,"y":66},
                  "c": {"x":33,"y":66},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":23,"y":51},
                  "e": {"x":33,"y":51},
                  "c": {"x":33,"y":51},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":24,"y":35},
                  "e": {"x":33,"y":35},
                  "c": {"x":33,"y":35},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              }]}),
          zoomin: (w) => 
            ({ct:[ {
              "t": "h",
              "o": "a",
              "p": {
                "t": "circle",
                "center": {"x":40,"y":41},
                "radius": 20,
                "n": "r",
                "outline": w === "bold" ? 6 : 3
              }
            },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":54,"y":55},
                  "e": {"x":71,"y":72},
                  "c": {"x":54,"y":55},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":30,"y":41},
                  "e": {"x":50,"y":41},
                  "c": {"x":40,"y":41},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":40,"y":31},
                  "e": {"x":40,"y":51},
                  "c": {"x":40,"y":41},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":55,"y":54},
                  "e": {"x":72,"y":71},
                  "c": {"x":50,"y":50},
                  "n": "r",
                  "t": w === "bold" ? 6 : 3
                }
              }]}),
          shoppingbag: (w) => 
          ({ct:[ {
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":73,"y":79},
                  "e": {"x":69,"y":39},
                  "c": {"x":73,"y":79},
                  "n": "r",
                  "t": w === "bold" ? 4 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":79,"y":73},
                  "e": {"x":77,"y":34},
                  "c": {"x":77,"y":34},
                  "n": "r",
                  "t": w === "bold" ? 4 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":22,"y":74},
                  "e": {"x":73,"y":79},
                  "c": {"x":22,"y":74},
                  "n": "r",
                  "t": w === "bold" ? 4 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":20,"y":41},
                  "e": {"x":69,"y":39},
                  "c": {"x":69,"y":39},
                  "n": "r",
                  "t": w === "bold" ? 4 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":22,"y":74},
                  "e": {"x":20,"y":41},
                  "c": {"x":20,"y":41},
                  "n": "r",
                  "t": w === "bold" ? 4 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":79,"y":73},
                  "e": {"x":73,"y":79},
                  "c": {"x":73,"y":79},
                  "n": "r",
                  "t": w === "bold" ? 4 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":25,"y":37},
                  "e": {"x":77,"y":34},
                  "c": {"x":77,"y":34},
                  "n": "r",
                  "t": w === "bold" ? 4 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":29,"y":45},
                  "e": {"x":55,"y":48},
                  "c": {"x":44,"y":-12},
                  "n": "r",
                  "t": w === "bold" ? 4 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":69,"y":39},
                  "e": {"x":77,"y":34},
                  "c": {"x":77,"y":34},
                  "n": "r",
                  "t": w === "bold" ? 4 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":20,"y":41},
                  "e": {"x":25,"y":37},
                  "c": {"x":20,"y":41},
                  "n": "r",
                  "t": w === "bold" ? 4 : 3
                }
              },{
                  "t": "l",
                  "o": "a",
                  "p": {
                  "s": {"x":41,"y":36},
                  "e": {"x":56,"y":35},
                  "c": {"x":49,"y":2},
                  "n": "r",
                  "t": w === "bold" ? 4 : 3
                }
              }
            ]
          })
      }
    // [
    //   weight to w.
    //    type =t
    //   operation = o
    //   add =a
    //   params = p
    //   start = s
    //   end = e
    //   curve = c 
    //   thickness = t
    //   corners = n
    //   round = r
    //   line = l
    //   shape = h
    //   actions  = ct
    // center = cn
    //   ]
      
    customElements.define("articulator-icon", ArticulatorElement);


    // Global Helper Functions
    
    
    
    function isValidColor(input) {
        if (typeof input !== "string") return false;
      
        const s = input.trim().toLowerCase();
      
        // 1. Named CSS colors
        const cssColors = new Set([
          "aliceblue","antiquewhite","aqua","aquamarine","azure","beige",
          "bisque","black","blanchedalmond","blue","blueviolet","brown",
          "burlywood","cadetblue","chartreuse","chocolate","coral",
          "cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan",
          "darkgoldenrod","darkgray","darkgreen","darkgrey","darkkhaki",
          "darkmagenta","darkolivegreen","darkorange","darkorchid","darkred",
          "darksalmon","darkseagreen","darkslateblue","darkslategray",
          "darkslategrey","darkturquoise","darkviolet","deeppink","deepskyblue",
          "dimgray","dimgrey","dodgerblue","firebrick","floralwhite","forestgreen",
          "fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","green",
          "greenyellow","grey","honeydew","hotpink","indianred","indigo","ivory",
          "khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue",
          "lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgreen",
          "lightgrey","lightpink","lightsalmon","lightseagreen","lightskyblue",
          "lightslategray","lightslategrey","lightsteelblue","lightyellow","lime",
          "limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue",
          "mediumorchid","mediumpurple","mediumseagreen","mediumslateblue",
          "mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue",
          "mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive",
          "olivedrab","orange","orangered","orchid","palegoldenrod","palegreen",
          "paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink",
          "plum","powderblue","purple","rebeccapurple","red","rosybrown",
          "royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell",
          "sienna","silver","skyblue","slateblue","slategray","slategrey","snow",
          "springgreen","steelblue","tan","teal","thistle","tomato","turquoise",
          "violet","wheat","white","whitesmoke","yellow","yellowgreen"
        ]);
      
        if (cssColors.has(s)) return true;
      
        // 2. Hex (#fff, #ffffff)
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return true;
      
        // 3. RGB / RGBA
        if (
          /^rgba?\(\s*(\d{1,3}%?\s*,\s*){2}\d{1,3}%?(\s*,\s*(0|1|0?\.\d+))?\s*\)$/.test(
            s
          )
        )
          return true;
      
        // 4. HSL / HSLA
        if (
          /^hsla?\(\s*\d{1,3}(\.\d+)?(deg|rad|turn)?\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%(\s*,\s*(0|1|0?\.\d+))?\s*\)$/.test(
            s
          )
        )
          return true;
        console.warn("wrong color" + " " + input + " " + " The color will be automatically converted to defalt");
        return false;
      }
      const keys = Object.keys(ArticulatorLibrary);

globalThis.ArticulatorAPI = Object.freeze({
    keys
});
  window.Articulator = {
      listIcons: () => Object.keys(ArticulatorLibrary),
    };
  })(window);




  
window.Articulator = {
    listIcons: () => Object.keys(window.ArticulatorLibrary || {}),
  
    feedback: (msg) =>
      console.log("Articulator Feedback sent:", msg),
  
    help: (attributes = {}, select = null) => {
      const data = {
        element: "articulator-icon",
  
        version: "1.1.0",
  
        description:
          "Canvas-based icon renderer using percentage-based geometry to achieve resolution-independent, visually consistent icons across all sizes and display densities.",
  
        rendering: {
          technology: "HTMLCanvasElement",
          geometry: "Normalized percentage vectors",
          scaling: "DevicePixelRatio-aware rendering",
          notes:
            "Canvas rendering avoids DOM bloat and ensures consistent stroke weight at any scale."
        },
  
        attributes: {
          name: {
            description:
              "Icon identifier from the Articulator Icon Library. This value maps directly to a predefined geometric definition.",
            type: "string",
            required: true
          },
  
          size: {
            description:
              "Defines the rendered icon size. Accepts CSS length units and scales proportionally.",
            type: "string",
            default: "1.5rem",
            acceptedFormats: ["px", "rem", "em"],
            examples: ["24px", "2rem", "1.25em"]
          },
          available: {
                  title:      " ========= Available(69) icons ==================  This is the list of all available icons at the moment: ",
                  list:      "menu, user, settings, arrowdown, arrowup, arrowleft, arrowright, heart, trush, download, upload, lock, home, search, add, minus, check, close  and bell "
          },

          theme: {
            description:
              "Controls contrast and color behavior for the icon. Intended to match surrounding UI themes.",
            type: "string",
            default: "light",
            values: ["light", "dark"]
          },
  
          weighticon: {
            description:
              "Determines stroke weight and fill behavior for the icon geometry.",
            type: "string",
            default: "outline",
            values: ["outline", "solid"]
          },
  
          ariaLabel: {
            description:
              "Optional accessibility label used by assistive technologies to describe the icon’s purpose.",
            type: "string",
            required: false
          }
        },
  
        example: {
          html: `<articulator-icon
            name="menu"
            weighticon="solid"
            theme="light"
            size="3rem"
            aria-label="Open navigation menu"
            class="Articulator-Icons">
          </articulator-icon>`
        },
  
        currentState: {
          name: attributes.name ?? null,
          size: attributes.size ?? "1.5rem",
          theme: attributes.theme ?? "light",
          weighticon: attributes.weighticon ?? "bold",
          ariaLabel: attributes.ariaLabel ?? null
        },
  
        resources: {
          media: {
            iconGallery:
              "https://articulatoricons.netlify.app/",
            designPreviews:
              "https://articulatoricons.netlify.app/"
          },
  
          documentation: {
            usageGuide:
              "https://articulatoricons.netlify.app/",
            apiReference:
              "https://articulatoricons.netlify.app/"
          },
  
          licensing: {
            iconLibrary:
             "https://articulatoricons.netlify.app/",
            componentCode:
              "https://articulatoricons.netlify.app/"
          },
  
          policies: {
            accessibility:
            "https://articulatoricons.netlify.app/",
            privacy:
              "https://articulatoricons.netlify.app/",
            security:
              "https://articulatoricons.netlify.app/"
          }
        }
      };
  
      // ── Section selector (dot-notation, optional) ──
      if (!select) return data;
  
      return select
        .split(".")
        .reduce(
          (obj, key) =>
            obj && obj[key] !== undefined ? obj[key] : null,
          data
        );
    }
  };
  
  // Global helper for feedback
window.ArticulatorFeedback = {
    send: (msg) => {
      // console.log("Articulator Feedback sent:", msg);
      // // Example: send to your API
      // fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ msg })
      // });
    }
  };
  
