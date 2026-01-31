
(function () {
    class ArticulatorElement extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
  
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", "0 0 100 100");
        this.svg.setAttribute("fill", "none");
        this.svg.setAttribute("stroke-linecap", "round");
        this.svg.setAttribute("stroke-linejoin", "round");
  
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
          stroke: red; 
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
        const size = this.getAttribute("size") || "2rem";
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
        let theme = this.getAttribute("theme") || "light";
        let weight = this.getAttribute("IconWeight") || "light";
        let strokeColor = this.getAttribute("color") || "black";
        let isvacolor = isValidColor(strokeColor);
        if (!isvacolor) {
            strokeColor = "black"; 
        }


        const iconData = ArticulatorLibrary[name];
        if (!iconData) return;
  
  
        iconData(weight, theme).actions.forEach(action => {
          if (action.type === "line") {
            this.drawLine(action.params, strokeColor);
          }
          if (action.type === "shape") {
            this.drawShape(action.params, strokeColor);
          }
        });
      }
  
      drawLine(p, strokeColor) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const { start, end, curve } = p;

        // Build the path "d" attribute
        let d = `M ${start.x} ${start.y} `;
        if (curve) {
            d += `Q ${curve.x} ${curve.y} ${end.x} ${end.y}`;
        } else {
            d += `L ${end.x} ${end.y}`;
        }
        path.setAttribute("d", d);

        // Validate stroke color, fall back to black if invalid
        const colorToUse = isValidColor(strokeColor) ? strokeColor : "black";
        path.setAttribute("stroke", colorToUse);
        // Other attributes
        path.setAttribute("stroke-width", p.thickness || 3);
        path.setAttribute("stroke-linecap", p.corners === "round" ? "round" : "butt");
        path.setAttribute("opacity", p.opacity ?? 1);

        // Append or remove depending on action
        if (p.remove) {
            // If p.remove === true, remove the path (optional feature)
            this.svg.style.backgroundColor = colorToUse;
            this.svg.removeChild(path);
        } else {
            this.svg.appendChild(path);
        }
      }
  
    //   drawShape(p, strokeColor) {
    //     if (p.type === "circle") {
    //       const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  
    //       el.setAttribute("cx", p.center.x);
    //       el.setAttribute("cy", p.center.y);
    //       el.setAttribute("r", p.radius);
  
    //       if (p.outline > 0) {
    //         el.setAttribute("stroke", strokeColor);
    //         el.setAttribute("stroke-width", p.outline);
    //         el.setAttribute("fill", "none");
    //       } else {
    //         el.setAttribute("fill", p.color || strokeColor);
    //       }
  
    //       el.setAttribute("opacity", p.opacity ?? 1);
    //       this.svg.appendChild(el);
    //     }
    //   }
    drawShape(p, strokeColor) {
        // Allowed SVG shapes
        const allowedShapes = ["circle", "rect", "line", "ellipse", "polygon", "path"];
      
        if (!allowedShapes.includes(p.type)) {
          console.warn(`Shape type "${p.type}" not allowed.`);
          return;
        }
      
        // Create the SVG element dynamically based on type
        const el = document.createElementNS("http://www.w3.org/2000/svg", p.type);
      
        // Set attributes depending on type
        switch (p.type) {
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
              el.setAttribute("rx", p.rounder.rx ?? 0);
              el.setAttribute("ry", p.rounder.ry ?? 0);
            }
            break;
      
          case "line":
            el.setAttribute("x1", p.start.x);
            el.setAttribute("y1", p.start.y);
            el.setAttribute("x2", p.end.x);
            el.setAttribute("y2", p.end.y);
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
      
          case "path": // Bezier or irregular curves
            el.setAttribute("d", p.d); // expects full SVG path string
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
      menu: (weight) => ({
        actions: [
          { type: "line", operation: "add", params: { start: { x: 20, y: 30 }, end: { x: 80, y: 30 }, thickness: weight === "bold" ? 10 : 3, corners: "round" }},
          { type: "line", operation: "add", params: { start: { x: 20, y: 50 }, end: { x: 80, y: 50 }, thickness: weight === "bold" ? 10 : 3, corners: "round" }},
          { type: "line", operation: "add", params: { start: { x: 20, y: 70 }, end: { x: 80, y: 70 }, thickness: weight === "bold" ? 10 : 3, corners: "round" }}
        ]
      }),
  
      user: (weight) => ({
        actions: [
          { type: "shape", operation: "add", params: { type: "circle", center: { x: 50, y: 35 }, radius: 15, outline: weight==="bold"?6:3 }},
          { type: "line", operation: "add", params: { start: { x: 20, y: 80 }, end: { x: 80, y: 80 }, curve: { x: 50, y: 50 }, thickness: weight==="bold"?6:3 }}
        ]
      }),
      home: (weight) => ({
        actions: [
          { type: "line", operation: "add", params: { start:{x:20,y:55}, end:{x:50,y:25}, corners: "round", thickness: weight==="bold"?6:3 }},
          { type: "line", operation: "add", params: { start:{x:50,y:25}, end:{x:80,y:55}, corners: "round", thickness: weight==="bold"?6:3 }},
          { type: "line", operation: "add", params: { start:{x:30,y:55}, end:{x:30,y:80}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type: "line", operation: "add", params: { start:{x:70,y:55}, end:{x:70,y:80}, corners: "round",  thickness: weight==="bold"?6:3  }},
          { type: "line", operation: "add", params: { start:{x:30,y:80}, end:{x:70,y:80}, corners: "round", thickness: weight==="bold"?6:3  }}
        ]
      }),
      
      search: (weight) => ({
        actions: [
          { type:"shape", operation:"add", params:{ type:"circle", center:{x:45,y:45}, radius:22, outline: weight==="bold"?6:3 }},
          { type:"line", operation:"add", params:{ start:{x:58,y:58}, end:{x:75,y:75}, thickness: weight==="bold"?6:3 }}
        ]
      }),
      
      settings: (weight) => ({
        actions: [
          { type:"shape", operation:"add", params:{ type:"circle", center:{x:50,y:50}, radius:13, outline: weight==="bold"?6:3 }},
          { type:"shape", operation:"add", params:{ type:"circle", center:{x:50,y:50}, radius:44, outline: weight==="bold"?6:3 }},
          { type:"shape", operation:"add", params:{ type:"circle", center:{x:50,y:50}, radius:25, outline: weight==="bold"?6:3 }},
          { type:"line", operation:"add", params:{ start:{x:50,y:15}, end:{x:50,y:30}, corners: "round", thickness: weight==="bold"?6:3}},
          { type:"line", operation:"add", params:{ start:{x:50,y:70}, end:{x:50,y:85}, corners: "round", thickness: weight==="bold"?6:3 }},
          { type:"line", operation:"add", params:{ start:{x:15,y:50}, end:{x:30,y:50}, corners: "round", thickness: weight==="bold"?6:3 }},
          { type:"line", operation:"add", params:{ start:{x:70,y:50}, end:{x:85,y:50}, corners: "round", thickness: weight==="bold"?6:3 }}
        ]
      }),
      
      plus: (weight) => ({
        actions: [
          { type:"line", operation:"add", params:{ start:{x:50,y:20}, end:{x:50,y:80}, corners: "round", thickness: weight==="bold"?6:3 }},
          { type:"line", operation:"add", params:{ start:{x:20,y:50}, end:{x:80,y:50}, corners: "round", thickness: weight==="bold"?6:3 }}
        ]
      }),
      
      minus: (weight) => ({
        actions: [
          { type:"line", operation:"add", params:{ start:{x:20,y:50}, end:{x:80,y:50},  corners: "round", thickness: weight==="bold"?6:3 }}
        ]
      }),
      
      check: (weight) => ({
        actions: [
          { type:"line", operation:"add", params:{ start:{x:20,y:55}, end:{x:40,y:75}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:40,y:75}, end:{x:80,y:30}, corners: "round", thickness: weight==="bold"?6:3  }}
        ]
      }),
      
      close: (weight) => ({
        actions: [
          { type:"line", operation:"add", params:{ start:{x:25,y:25}, end:{x:75,y:75}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:75,y:25}, end:{x:25,y:75}, corners: "round", thickness: weight==="bold"?6:3  }}
        ]
      }),
      
      arrowright: (weight) => ({
        actions: [
          { type:"line", operation:"add", params:{ start:{x:20,y:50}, end:{x:70,y:50}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:55,y:35}, end:{x:70,y:50}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:55,y:65}, end:{x:70,y:50}, corners: "round", thickness: weight==="bold"?6:3  }}
        ]
      }),
      
      arrowleft: (weight) => ({
        actions: [
          { type:"line", operation:"add", params:{ start:{x:80,y:50}, end:{x:30,y:50}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:45,y:35}, end:{x:30,y:50}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:45,y:65}, end:{x:30,y:50}, corners: "round", thickness: weight==="bold"?6:3  }}
        ]
      }),
      
      arrowup: (weight) => ({
        actions: [
          { type:"line", operation:"add", params:{ start:{x:50,y:80}, end:{x:50,y:30}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:35,y:45}, end:{x:50,y:30}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:65,y:45}, end:{x:50,y:30}, corners: "round", thickness: weight==="bold"?6:3  }}
        ]
      }),
      
      arrowdown: (weight) => ({
        actions: [
          { type:"line", operation:"add", params:{ start:{x:50,y:20}, end:{x:50,y:70}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:35,y:55}, end:{x:50,y:70}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:65,y:55}, end:{x:50,y:70}, corners: "round", thickness: weight==="bold"?6:3  }}
        ]
      }),
      
      bell: (weight) => ({
        actions: [
          { type:"shape", operation:"add", params:{ type:"circle", center:{x:50,y:75}, radius:5, outline: weight==="bold"?0:3 }},
          { type:"line", operation:"add", params:{ start:{x:35,y:65}, end:{x:65,y:65}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:60,y:35}, end:{x:40,y:35}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:35,y:65}, end:{x:40,y:35}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:65,y:65}, end:{x:60,y:35}, corners: "round", thickness: weight==="bold"?6:3  }}
        ]
      }),
      
      heart: (weight) => ({
        actions: [
            { type: "line", operation: "add", params: { start: { x: 50, y: 85 }, end: { x: 20, y: 45 }, corners: "round", thickness: weight === "bold" ? 6 : 3 }},
            { type: "line", operation: "add", params: { start: { x: 20, y: 45 }, end: { x: 50, y: 35 }, curve: { x: 25, y: 15 }, thickness: weight === "bold" ? 6 : 3, corners: "round" }},
            { type: "line", operation: "add", params: { start: { x: 50, y: 35 }, end: { x: 80, y: 45 }, curve: { x: 75, y: 15 }, thickness: weight === "bold" ? 6 : 3, corners: "round" }},
            { type: "line", operation: "add", params: { start: { x: 80, y: 45 }, end: { x: 50, y: 85 }, corners: "round", thickness: weight === "bold" ? 6 : 3 }}
        ]
      }),
      
      lock: (weight) => ({
        actions: [
            { type: "line", operation: "add", params: { start: { x: 30, y: 45 }, end: { x: 70, y: 45 }, corners: "round", thickness: weight === "bold" ? 6 : 3 }},
            { type: "line", operation: "add", params: { start: { x: 30, y: 45 }, end: { x: 30, y: 80 },  corners: "round", thickness: weight === "bold" ? 6 : 3 }},
            { type: "line", operation: "add", params: { start: { x: 70, y: 45 }, end: { x: 70, y: 80 }, corners: "round", thickness: weight === "bold" ? 6 : 3 }},
            { type: "line", operation: "add", params: { start: { x: 30, y: 80 }, end: { x: 70, y: 80 }, corners: "round", thickness: weight === "bold" ? 6 : 3 }},
            { type: "shape", operation: "add", params: { type: "circle", center: { x: 50, y: 60 }, radius: 6, outline: 0 }},
            { type: "line", operation: "add", params: { start: { x: 50, y: 63 }, end: { x: 50, y: 72 }, thickness: weight === "bold" ? 5 : 3, corners: "round" }},
            { type: "line", operation: "add", params: { start: { x: 35, y: 43 }, end: { x: 50, y: 22 }, curve: { x: 32, y: 22 }, thickness: weight === "bold" ? 5 : 3, corners: "round" }},
            { type: "line", operation: "add", params: { start: { x: 50, y: 22 }, end: { x: 65, y: 43 }, curve: { x: 68, y: 22 }, thickness: weight === "bold" ? 5 : 3, corners: "round" }}
        ]
      }),
      
      unlock: (weight) => ({
        actions: [
          { type:"shape", operation:"add", params:{ type:"circle", center:{x:50,y:50}, radius:15, outline:3 }},
          { type:"line", operation:"add", params:{ start:{x:35,y:35}, end:{x:35,y:50}, corners: "round", thickness: weight==="bold"?6:3  }}
        ]
      }),
      
      trash: (weight) => ({
        actions: [
          { type:"line", operation:"add", params:{ start:{x:30,y:30}, end:{x:70,y:30}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:35,y:30}, end:{x:35,y:75}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:65,y:30}, end:{x:65,y:75}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:35,y:78}, end:{x:65,y:78}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:45,y:70}, end:{x:55,y:70}, corners: "round", thickness: weight==="bold"?6:3  }}
        ]
      }),
      
      download: (weight) => ({
        actions: [
          { type:"line", operation:"add", params:{ start:{x:50,y:20}, end:{x:50,y:60}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:35,y:45}, end:{x:50,y:60}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:65,y:45}, end:{x:50,y:60}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:30,y:75}, end:{x:70,y:75}, corners: "round", thickness: weight==="bold"?6:3  }}
        ]
      }),
      
      upload: (weight) => ({
        actions: [
          { type:"line", operation:"add", params:{ start:{x:50,y:80}, end:{x:50,y:40}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:35,y:55}, end:{x:50,y:40}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:65,y:55}, end:{x:50,y:40}, corners: "round", thickness: weight==="bold"?6:3  }},
          { type:"line", operation:"add", params:{ start:{x:30,y:25}, end:{x:70,y:25}, corners: "round", thickness: weight==="bold"?6:3  }}
        ]
      }),      
      bookmark: (weight) =>({
        actions: [
          { type:"line", operation:"add", params:{ start:{x:29,y:12}, end:{x:29,y:75}, corners:"round", thickness: weight==="bold"?6:3 }},
          { type:"line", operation:"add", params:{ start:{x:29,y:12}, end:{x:69,y:12}, corners:"round", thickness: weight==="bold"?6:3 }},
          { type:"line", operation:"add", params:{ start:{x:69,y:12}, end:{x:70,y:75}, corners:"round", thickness: weight==="bold"?6:3 }},
          { type:"line", operation:"add", params:{ start:{x:29,y:75}, end:{x:51,y:85}, corners:"round", thickness: weight==="bold"?6:3 }},
          { type:"line", operation:"add", params:{ start:{x:51,y:85}, end:{x:70,y:75}, corners:"round", thickness: weight==="bold"?6:3 }},
          { type:"line", operation:"add", params:{ start:{x:37,y:49}, end:{x:47,y:59}, corners:"round", thickness: weight==="bold"?6:3 }},
          { type:"line", operation:"add", params:{ start:{x:47,y:59}, end:{x:64,y:39}, corners:"round", thickness: weight==="bold"?6:3 }}
        ]
        
      }),
      play: (weight) =>({
        actions: [
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 20,
                "y": 17
              },
              "end": {
                "x": 85,
                "y": 52
              },
              "curve": {
                "x": 53,
                "y": 35
              },
              corners:"round",
              thickness: weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 20,
                "y": 84
              },
              "end": {
                "x": 85,
                "y": 52
              },
              "curve": {
                "x": 51,
                "y": 69
              },
              corners:"round",
              thickness: weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 20,
                "y": 84
              },
              "end": {
                "x": 20,
                "y": 17
              },
              "curve": {
                "x": 20,
                "y": 50
              },
              corners:"round",
              thickness: weight==="bold"?6:3 
            }
          }
        ]
      }), 
      pause: (weight) =>({
        actions: [
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 28,
                "y": 85
              },
              "end": {
                "x": 28,
                "y": 16
              },
              "curve": {
                "x": 28,
                "y": 45
              },
              "corners": "round",
              "thickness": weight==="bold"?9:4
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 70,
                "y": 17
              },
              "end": {
                "x": 70,
                "y": 84
              },
              "curve": {
                "x": 70,
                "y": 52
              },
              "corners": "round",
              "thickness": weight==="bold"?9:4
            }
          }
        ]
      }), 
      filter: (weight) =>({
        actions: [
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 16,
                "y": 30
              },
              "end": {
                "x": 85,
                "y": 30
              },
              "curve": {
                "x": 54,
                "y": 30
              },
              "corners": "round",
              "thickness": weight==="bold"?9:4
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 29,
                "y": 51
              },
              "end": {
                "x": 75,
                "y": 51
              },
              "curve": {
                "x": 52,
                "y": 51
              },
              "corners": "round",
              "thickness": weight==="bold"?9:4
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 37,
                "y": 69
              },
              "end": {
                "x": 64,
                "y": 69
              },
              "curve": {
                "x": 51,
                "y": 69
              },
              "corners": "round",
              "thickness": weight==="bold"?9:4
            }
          }
        ]
      }), 
      list: (weight) =>({
        actions: [
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 31,
                "y": 69
              },
              "end": {
                "x": 85,
                "y": 69
              },
              "curve": {
                "x": 58,
                "y": 69
              },
              "corners": "round",
              "thickness": weight==="bold"?9:4
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 31,
                "y": 49
              },
              "end": {
                "x": 85,
                "y": 49
              },
              "curve": {
                "x": 58,
                "y": 49
              },
              "corners": "round",
              "thickness": weight==="bold"?9:4
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 31,
                "y": 31
              },
              "end": {
                "x": 84,
                "y": 31
              },
              "curve": {
                "x": 61,
                "y": 31
              },
              "corners": "round",
             "thickness": weight==="bold"?9:4
            }
          },
          {
            "type": "shape",
            "operation": "add",
            "params": {
              "type": "circle",
              "center": {
                "x": 19,
                "y": 30
              },
              "radius": 2,
              "corners": "round",
              "outline": weight==="bold"?9:4
            }
          },
          {
            "type": "shape",
            "operation": "add",
            "params": {
              "type": "circle",
              "center": {
                "x": 19,
                "y": 49
              },
              "radius": 2,
              "corners": "round",
              "outline": weight==="bold"?9:4
            }
          },
          {
            "type": "shape",
            "operation": "add",
            "params": {
              "type": "circle",
              "center": {
                "x": 19,
                "y": 69
              },
              "radius": 2,
              "corners": "round",
              "outline": weight==="bold"?9:4
            }
          }
        ]
      }),
      wifi: (weight) =>({
        actions: [
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 16,
                "y": 28
              },
              "end": {
                "x": 84,
                "y": 28
              },
              "curve": {
                "x": 52,
                "y": 10
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 26,
                "y": 46
              },
              "end": {
                "x": 75,
                "y": 47
              },
              "curve": {
                "x": 52,
                "y": 32
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 38,
                "y": 61
              },
              "end": {
                "x": 62,
                "y": 61
              },
              "curve": {
                "x": 51,
                "y": 53
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3
            }
          },
          {
            "type": "shape",
            "operation": "add",
            "params": {
              "type": "circle",
              "center": {
                "x": 51,
                "y": 75
              },
              "radius": 2,
              "corners": "round",
              "outline": weight==="bold"?6:3
            }
          }
        ]
      }), 
      pin: (weight) =>({
        actions: [
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 50,
                "y": 84
              },
              "end": {
                "x": 50,
                "y": 38
              },
              "curve": {
                "x": 50,
                "y": 50
              },
              "corners": "round",
              "thickness": weight==="bold"?9:5
            }
          },
          {
            "type": "shape",
            "operation": "add",
            "params": {
              "type": "circle",
              "center": {
                "x": 50,
                "y": 27
              },
              "radius": 11,
              "corners": "round",
              "outline": weight==="bold"?9:4
            }
          }
        ]
      }),
      compass: (weight) =>({
        actions: [
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 29,
                "y": 50
              },
              "end": {
                "x": 73,
                "y": 51
              },
              "curve": {
                "x": 50,
                "y": 50
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 50,
                "y": 16
              },
              "end": {
                "x": 50,
                "y": 85
              },
              "curve": {
                "x": 50,
                "y": 43
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 62,
                "y": 28
              },
              "end": {
                "x": 50,
                "y": 16
              },
              "curve": {
                "x": 53,
                "y": 19
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 40,
                "y": 28
              },
              "end": {
                "x": 50,
                "y": 16
              },
              "curve": {
                "x": 47,
                "y": 20
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          }
        ]
      }), 
      laptop: (weight) =>({
        actions: [
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 19,
                "y": 22
              },
              "end": {
                "x": 81,
                "y": 22
              },
              "curve": {
                "x": 49,
                "y": 22
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 19,
                "y": 63
              },
              "end": {
                "x": 81,
                "y": 63
              },
              "curve": {
                "x": 52,
                "y": 63
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 19,
                "y": 22
              },
              "end": {
                "x": 19,
                "y": 63
              },
              "curve": {
                "x": 19,
                "y": 45
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 81,
                "y": 22
              },
              "end": {
                "x": 81,
                "y": 63
              },
              "curve": {
                "x": 81,
                "y": 36
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 14,
                "y": 72
              },
              "end": {
                "x": 86,
                "y": 72
              },
              "curve": {
                "x": 51,
                "y": 72
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          }
        ]
      }), 
      tag:(weight) =>({
        actions: [
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 43,
                "y": 20
              },
              "end": {
                "x": 81,
                "y": 60
              },
              "curve": {
                "x": 61,
                "y": 39
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 20,
                "y": 42
              },
              "end": {
                "x": 59,
                "y": 82
              },
              "curve": {
                "x": 39,
                "y": 62
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 20,
                "y": 42
              },
              "end": {
                "x": 21,
                "y": 21
              },
              "curve": {
                "x": 20,
                "y": 30
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 21,
                "y": 21
              },
              "end": {
                "x": 43,
                "y": 20
              },
              "curve": {
                "x": 32,
                "y": 20
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 59,
                "y": 82
              },
              "end": {
                "x": 81,
                "y": 60
              },
              "curve": {
                "x": 70,
                "y": 71
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3
            }
          },
          {
            "type": "shape",
            "operation": "add",
            "params": {
              "type": "circle",
              "center": {
                "x": 30,
                "y": 30
              },
              "radius": 3,
              "corners": "round",
              "outline": weight==="bold"?6:3
            }
          }
        ]
      }), 
      battery: (weight) =>({
        actions: [
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 16,
                "y": 63
              },
              "end": {
                "x": 79,
                "y": 63
              },
              "curve": {
                "x": 52,
                "y": 63
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 16,
                "y": 35
              },
              "end": {
                "x": 79,
                "y": 35
              },
              "curve": {
                "x": 49,
                "y": 35
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 16,
                "y": 35
              },
              "end": {
                "x": 16,
                "y": 63
              },
              "curve": {
                "x": 16,
                "y": 52
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 79,
                "y": 35
              },
              "end": {
                "x": 79,
                "y": 63
              },
              "curve": {
                "x": 79,
                "y": 50
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 81,
                "y": 45
              },
              "end": {
                "x": 81,
                "y": 54
              },
              "curve": {
                "x": 81,
                "y": 50
              },
              "corners": "round",
              "thickness": weight==="bold"?10:3 
            }
          }
        ]
      }), 
      batteryLow: (weight) =>({
        actions: [
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 16,
                "y": 63
              },
              "end": {
                "x": 79,
                "y": 63
              },
              "curve": {
                "x": 52,
                "y": 63
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 16,
                "y": 35
              },
              "end": {
                "x": 79,
                "y": 35
              },
              "curve": {
                "x": 49,
                "y": 35
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 16,
                "y": 35
              },
              "end": {
                "x": 16,
                "y": 63
              },
              "curve": {
                "x": 16,
                "y": 52
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 79,
                "y": 35
              },
              "end": {
                "x": 79,
                "y": 63
              },
              "curve": {
                "x": 79,
                "y": 50
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 81,
                "y": 45
              },
              "end": {
                "x": 81,
                "y": 54
              },
              "curve": {
                "x": 81,
                "y": 50
              },
              "corners": "round",
              "thickness": weight==="bold"?10:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 25,
                "y": 43
              },
              "end": {
                "x": 25,
                "y": 55
              },
              "curve": {
                "x": 25,
                "y": 59
              },
              "corners": "round",
              "thickness": weight==="bold"?6:6
            }
          }
        ]
      }),
      charging: (weight) =>({
        actions: [
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 16,
                "y": 63
              },
              "end": {
                "x": 79,
                "y": 63
              },
              "curve": {
                "x": 52,
                "y": 63
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 16,
                "y": 35
              },
              "end": {
                "x": 79,
                "y": 35
              },
              "curve": {
                "x": 49,
                "y": 35
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 16,
                "y": 35
              },
              "end": {
                "x": 16,
                "y": 63
              },
              "curve": {
                "x": 16,
                "y": 52
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 79,
                "y": 35
              },
              "end": {
                "x": 79,
                "y": 63
              },
              "curve": {
                "x": 79,
                "y": 50
              },
              "corners": "round",
              "thickness": weight==="bold"?6:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 81,
                "y": 45
              },
              "end": {
                "x": 81,
                "y": 54
              },
              "curve": {
                "x": 81,
                "y": 50
              },
              "corners": "round",
              "thickness": weight==="bold"?10:3 
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
              "x": 56,
              "y": 42
            },
            "end": {
              "x": 46,
              "y": 52
            },
            "curve": {
              "x": 50,
              "y": 48
            },
              "corners": "round",
              "thickness": 6
            }
          },
          {
            "type": "line",
            "operation": "add",
            "params": {
              "start": {
                "x": 44,
                "y": 58
              },
              "end": {
                "x": 54,
                "y": 48
              },
              "curve": {
                "x": 48,
                "y": 54
              },
              "corners": "round",
              "thickness": 6
            }
          }
        ]
      }),
      logout: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":80}, "end": {"x":16,"y":22}, "curve": {"x":16,"y":51}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":80}, "end": {"x":73,"y":80}, "curve": {"x":47,"y":79}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":22}, "end": {"x":72,"y":22}, "curve": {"x":48,"y":22}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":72,"y":22}, "end": {"x":72,"y":39}, "curve": {"x":72,"y":30}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":73,"y":63}, "end": {"x":73,"y":80}, "curve": {"x":73,"y":72}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":36,"y":52}, "end": {"x":87,"y":52}, "curve": {"x":54,"y":52}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":79,"y":40}, "end": {"x":87,"y":52}, "curve": {"x":83,"y":45}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":79,"y":61}, "end": {"x":87,"y":52}, "curve": {"x":82,"y":58}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } }] }),
       reply: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":21,"y":80}, "end": {"x":67,"y":56}, "curve": {"x":40,"y":54}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":21,"y":80}, "end": {"x":67,"y":38}, "curve": {"x":35,"y":36}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":85,"y":47}, "end": {"x":68,"y":65}, "curve": {"x":77,"y":51}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":68,"y":30}, "end": {"x":85,"y":47}, "curve": {"x":76,"y":39}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":67,"y":30}, "end": {"x":67,"y":38}, "curve": {"x":67,"y":34}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":67,"y":56}, "end": {"x":67,"y":65}, "curve": {"x":67,"y":61}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } }] }),
      //  forward: (weight) => 
      //   ({ "actions":[{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": undefined, "radius": undefined, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": undefined, "radius": undefined, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":24,"y":60}, "end": {"x":15,"y":50}, "curve": {"x":15,"y":60}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":15,"y":50}, "end": {"x":23,"y":42}, "curve": {"x":15,"y":42}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":64,"y":53}, "end": {"x":74,"y":60}, "curve": {"x":64,"y":53}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } }] }),
       drop: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":17,"y":39}, "end": {"x":49,"y":70}, "curve": {"x":30,"y":51}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":49,"y":70}, "end": {"x":84,"y":40}, "curve": {"x":62,"y":58}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } }] }),
       growth: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":72}, "end": {"x":71,"y":31}, "curve": {"x":55,"y":78}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":71,"y":31}, "end": {"x":62,"y":34}, "curve": {"x":66,"y":33}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":78}, "end": {"x":81,"y":79}, "curve": {"x":50,"y":79}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":80,"y":34}, "end": {"x":81,"y":79}, "curve": {"x":80,"y":52}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":71,"y":43}, "end": {"x":70,"y":79}, "curve": {"x":71,"y":57}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":62,"y":57}, "end": {"x":62,"y":79}, "curve": {"x":62,"y":69}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":53,"y":79}, "end": {"x":53,"y":68}, "curve": {"x":53,"y":74}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":44,"y":73}, "end": {"x":44,"y":78}, "curve": {"x":44,"y":78}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":35,"y":79}, "end": {"x":35,"y":74}, "curve": {"x":35,"y":79}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":20,"y":77}, "end": {"x":29,"y":77}, "curve": {"x":24,"y":77}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } }] }),
       desktop: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":18,"y":81}, "end": {"x":83,"y":81}, "curve": {"x":50,"y":81}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":21,"y":67}, "end": {"x":41,"y":67}, "curve": {"x":32,"y":67}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":58,"y":67}, "end": {"x":76,"y":67}, "curve": {"x":67,"y":67}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":21,"y":29}, "end": {"x":21,"y":67}, "curve": {"x":21,"y":49}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":21,"y":29}, "end": {"x":76,"y":29}, "curve": {"x":49,"y":29}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":76,"y":29}, "end": {"x":76,"y":67}, "curve": {"x":76,"y":47}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":44,"y":81}, "end": {"x":44,"y":60}, "curve": {"x":44,"y":60}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":49,"y":60}, "end": {"x":49,"y":81}, "curve": {"x":49,"y":67}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":54,"y":60}, "end": {"x":54,"y":81}, "curve": {"x":54,"y":68}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":18,"y":82}, "end": {"x":83,"y":82}, "curve": {"x":50,"y":82}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } }] }),
       uploadfile: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":27,"y":80}, "end": {"x":72,"y":80}, "curve": {"x":49,"y":80}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":27,"y":80}, "end": {"x":28,"y":24}, "curve": {"x":27,"y":50}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":72,"y":36}, "end": {"x":72,"y":80}, "curve": {"x":72,"y":49}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":64,"y":24}, "end": {"x":71,"y":36}, "curve": {"x":72,"y":36}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":49,"y":51}, "end": {"x":49,"y":14}, "curve": {"x":49,"y":51}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":28,"y":24}, "end": {"x":44,"y":24}, "curve": {"x":37,"y":24}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":53,"y":23}, "end": {"x":64,"y":24}, "curve": {"x":57,"y":23}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":49,"y":14}, "end": {"x":54,"y":19}, "curve": {"x":53,"y":18}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":49,"y":14}, "end": {"x":43,"y":19}, "curve": {"x":45,"y":17}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } }] }),
       eyeShow: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":46}, "end": {"x":84,"y":47}, "curve": {"x":51,"y":12}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":46}, "end": {"x":84,"y":47}, "curve": {"x":49,"y":81}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":50,"y":47}, "radius": 10, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":47,"y":37}, "end": {"x":84,"y":47}, "curve": {"x":55,"y":36}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":46}, "end": {"x":51,"y":57}, "curve": {"x":43,"y":59}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":50,"y":47}, "radius": 3, "corners": "round", "outline": weight === "bold" ? 6 : 3 } }] }),
       eyehide: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":46}, "end": {"x":84,"y":47}, "curve": {"x":51,"y":12}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":46}, "end": {"x":84,"y":47}, "curve": {"x":49,"y":81}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":50,"y":47}, "radius": 10, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":47,"y":37}, "end": {"x":84,"y":47}, "curve": {"x":55,"y":36}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":46}, "end": {"x":51,"y":57}, "curve": {"x":43,"y":59}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":50,"y":47}, "radius": 3, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":30,"y":27}, "end": {"x":68,"y":71}, "curve": {"x":50,"y":50}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":32,"y":25}, "end": {"x":70,"y":70}, "curve": {"x":51,"y":48}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } }] }),
       Shield: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":27,"y":63}, "end": {"x":49,"y":83}, "curve": {"x":29,"y":77}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":49,"y":83}, "end": {"x":73,"y":63}, "curve": {"x":69,"y":79}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":73,"y":32}, "end": {"x":73,"y":63}, "curve": {"x":73,"y":46}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":27,"y":63}, "end": {"x":27,"y":32}, "curve": {"x":27,"y":47}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":27,"y":32}, "end": {"x":52,"y":24}, "curve": {"x":42,"y":31}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":52,"y":24}, "end": {"x":73,"y":32}, "curve": {"x":58,"y":30}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":73,"y":32}, "end": {"x":49,"y":83}, "curve": {"x":20,"y":64}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } }] }),
       privacy: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":27,"y":63}, "end": {"x":49,"y":83}, "curve": {"x":29,"y":77}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":49,"y":83}, "end": {"x":73,"y":63}, "curve": {"x":69,"y":79}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":73,"y":32}, "end": {"x":73,"y":63}, "curve": {"x":73,"y":46}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":27,"y":63}, "end": {"x":27,"y":32}, "curve": {"x":27,"y":47}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":27,"y":32}, "end": {"x":52,"y":24}, "curve": {"x":42,"y":31}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":52,"y":24}, "end": {"x":73,"y":32}, "curve": {"x":58,"y":30}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":67,"y":65}, "end": {"x":32,"y":66}, "curve": {"x":50,"y":48}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":50,"y":42}, "radius": 8, "corners": "round", "outline": weight === "bold" ? 6 : 3 } }] }),
       friends: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":41,"y":66}, "end": {"x":85,"y":66}, "curve": {"x":64,"y":48}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":63,"y":37}, "radius": 12, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":65}, "end": {"x":49,"y":61}, "curve": {"x":38,"y":47}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":37,"y":42}, "radius": 9, "corners": "round", "outline": weight === "bold" ? 6 : 3 } }] }),
       flag: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":24,"y":84}, "end": {"x":23,"y":19}, "curve": {"x":23,"y":51}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":23,"y":51}, "end": {"x":79,"y":49}, "curve": {"x":44,"y":41}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":23,"y":19}, "end": {"x":79,"y":49}, "curve": {"x":64,"y":21}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } }] }),
       mail: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":74}, "end": {"x":85,"y":73}, "curve": {"x":49,"y":74}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":29}, "end": {"x":85,"y":28}, "curve": {"x":53,"y":29}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":74}, "end": {"x":16,"y":29}, "curve": {"x":16,"y":50}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":85,"y":28}, "end": {"x":85,"y":73}, "curve": {"x":84,"y":49}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":27,"y":38}, "end": {"x":73,"y":36}, "curve": {"x":50,"y":60}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } }] }),
       share: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":28,"y":20}, "end": {"x":71,"y":51}, "curve": {"x":49,"y":36}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":25,"y":77}, "end": {"x":71,"y":55}, "curve": {"x":50,"y":65}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":74,"y":53}, "radius": 3, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":25,"y":19}, "radius": 3, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":22,"y":79}, "radius": 3, "corners": "round", "outline": weight === "bold" ? 6 : 3 } }] }),
       call: (weight) => 
        ({ "actions":[{ "type": "line", "operation": "add", "params": { "start": {"x":82,"y":29}, "end": {"x":34,"y":80}, "curve": {"x":72,"y":67}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":37,"y":67}, "end": {"x":66,"y":36}, "curve": {"x":61,"y":57}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":72,"y":27}, "radius": 10, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":27,"y":72}, "radius": 10, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":72,"y":27}, "radius": 8, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":27,"y":72}, "radius": 8, "corners": "round", "outline": weight ===  "bold" ? 6 : 3 } }] }),
       star: (weight) => 
        ({ "actions":[{"type": "line", "operation": "add", "params": { "start": {"x":61,"y":38}, "end": {"x":84,"y":38}, "curve": {"x":84,"y":38}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":39,"y":38}, "end": {"x":51,"y":14}, "curve": {"x":41,"y":33}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":66,"y":50}, "end": {"x":75,"y":79}, "curve": {"x":66,"y":52}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":66,"y":52}, "end": {"x":84,"y":38}, "curve": {"x":66,"y":52}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":49,"y":60}, "end": {"x":75,"y":79}, "curve": {"x":49,"y":60}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":22,"y":78}, "end": {"x":49,"y":60}, "curve": {"x":39,"y":66}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":51,"y":14}, "end": {"x":61,"y":38}, "curve": {"x":55,"y":25}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":22,"y":78}, "end": {"x":33,"y":51}, "curve": {"x":30,"y":59}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":33,"y":51}, "end": {"x":16,"y":38}, "curve": {"x":23,"y":44}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":16,"y":38}, "end": {"x":39,"y":38}, "curve": {"x":27,"y":38}, "corners": "round", "thickness": weight ===  "bold" ? 6 : 3 } }] }),
       info: (weight) => 
        ({ "actions":[{"type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":50,"y":49}, "radius": 33, "corners": "round", "outline": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":51,"y":65}, "end": {"x":49,"y":23}, "curve": {"x":50,"y":49}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":52,"y":65}, "end": {"x":50,"y":23}, "curve": {"x":51,"y":50}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":50,"y":65}, "end": {"x":48,"y":23}, "curve": {"x":49,"y":50}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":51,"y":73}, "radius": 2, "corners": "round", "outline": weight ===  "bold" ? 6 : 3 } }] }),
       key: (weight) => 
        ({ "actions":[{"type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":49,"y":26}, "radius": 12, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":49,"y":26}, "radius": 10, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "line", "operation": "add", "params": { "start": {"x":41,"y":36}, "end": {"x":43,"y":81}, "curve": {"x":41,"y":36}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":43,"y":81}, "end": {"x":50,"y":85}, "curve": {"x":50,"y":85}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":50,"y":85}, "end": {"x":55,"y":82}, "curve": {"x":55,"y":82}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }, "type": "line", "operation": "add", "params": { "start": {"x":57,"y":35}, "end": {"x":57,"y":42}, "curve": {"x":57,"y":42}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":57,"y":42}, "end": {"x":50,"y":50}, "curve": {"x":57,"y":42}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":54,"y":44}, "end": {"x":55,"y":82}, "curve": {"x":54,"y":44}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":47,"y":83}, "end": {"x":45,"y":43}, "curve": {"x":45,"y":43}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":47,"y":83}, "end": {"x":45,"y":43}, "curve": {"x":45,"y":43}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }, "type": "line", "operation": "add", "params": { "start": {"x":52,"y":54}, "end": {"x":53,"y":78}, "curve": {"x":52,"y":54}, "corners": "round", "thickness": weight ===  "bold" ? 6 : 3 } }] }),
       location: (weight) => 
        ({ "actions":[{"type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":48,"y":33}, "radius": 18, "corners": "round", "outline": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":46,"y":85}, "end": {"x":29,"y":33}, "curve": {"x":33,"y":51}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":46,"y":85}, "end": {"x":66,"y":36}, "curve": {"x":56,"y":61}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":48,"y":33}, "radius": 6, "corners": "round", "outline": weight ===  "bold" ? 6 : 3 } }] }),
       bluetooth: (weight) => 
        ({ "actions":[{"type": "line", "operation": "add", "params": { "start": {"x":40,"y":83}, "end": {"x":40,"y":17}, "curve": {"x":40,"y":50}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":61,"y":33}, "end": {"x":21,"y":68}, "curve": {"x":40,"y":50}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":40,"y":83}, "end": {"x":60,"y":68}, "curve": {"x":40,"y":83}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":22,"y":32}, "end": {"x":60,"y":68}, "curve": {"x":40,"y":50}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":40,"y":17}, "end": {"x":61,"y":33}, "curve": {"x":61,"y":33}, "corners": "round", "thickness": weight ===  "bold" ? 6 : 3 } }] }),
       chat: (weight) => 
        ({ "actions":[{"type": "line", "operation": "add", "params": { "start": {"x":29,"y":65}, "end": {"x":20,"y":71}, "curve": {"x":26,"y":69}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":50,"y":47}, "radius": 27, "corners": "round", "outline": weight === "bold" ? 6 : 3 }},{"type": "line", "operation": "add", "params": { "start": {"x":20,"y":71}, "end": {"x":38,"y":71}, "curve": {"x":28,"y":75}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":38,"y":47}, "radius": 3, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":50,"y":47}, "radius": 3, "corners": "round", "outline": weight === "bold" ? 6 : 3 } },{ "type": "shape", "operation": "add", "params": { "type": "circle", "center": {"x":62,"y":48}, "radius": 3, "corners": "round", "outline": weight === "bold" ? 6 : 3 } }] }),
       microphone: (weight) => 
        ({ "actions":[{"type": "line", "operation": "add", "params": { "start": {"x":32,"y":22}, "end": {"x":32,"y":66}, "curve": {"x":32,"y":66}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":36,"y":21}, "end": {"x":36,"y":62}, "curve": {"x":36,"y":21}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":63,"y":22}, "end": {"x":63,"y":65}, "curve": {"x":63,"y":22}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":58,"y":20}, "end": {"x":58,"y":61}, "curve": {"x":58,"y":20}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":47,"y":75}, "end": {"x":47,"y":85}, "curve": {"x":47,"y":75}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":36,"y":22}, "end": {"x":46,"y":13}, "curve": {"x":36,"y":12}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":58,"y":61}, "end": {"x":47,"y":69}, "curve": {"x":58,"y":68}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":32,"y":64}, "end": {"x":47,"y":75}, "curve": {"x":32,"y":75}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":63,"y":63}, "end": {"x":47,"y":75}, "curve": {"x":61,"y":75}, "corners": "round", "thickness": weight ===  "bold" ? 6 : 3 } }] }),
       attachment: (weight) => 
        ({ "actions":[{"type": "line", "operation": "add", "params": { "start": {"x":28,"y":81}, "end": {"x":28,"y":20}, "curve": {"x":28,"y":81}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":70,"y":29}, "end": {"x":69,"y":82}, "curve": {"x":70,"y":29}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":28,"y":81}, "end": {"x":69,"y":82}, "curve": {"x":28,"y":81}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":61,"y":20}, "end": {"x":70,"y":29}, "curve": {"x":61,"y":20}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":28,"y":20}, "end": {"x":61,"y":20}, "curve": {"x":61,"y":20}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":44,"y":56}, "end": {"x":59,"y":44}, "curve": {"x":44,"y":56}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }, "type": "line", "operation": "add", "params": { "start": {"x":44,"y":49}, "end": {"x":36,"y":56}, "curve": {"x":36,"y":56}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":51,"y":56}, "end": {"x":44,"y":63}, "curve": {"x":51,"y":56}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":38,"y":54}, "end": {"x":36,"y":63}, "curve": {"x":33,"y":60}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":45,"y":62}, "end": {"x":36,"y":63}, "curve": {"x":40,"y":67}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":50,"y":44}, "end": {"x":57,"y":38}, "curve": {"x":50,"y":44}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":58,"y":51}, "end": {"x":66,"y":44}, "curve": {"x":66,"y":44}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":65,"y":37}, "end": {"x":56,"y":39}, "curve": {"x":61,"y":33}, "corners": "round", "thickness": weight === "bold" ? 6 : 3 }},{ "type": "line", "operation": "add", "params": { "start": {"x":65,"y":37}, "end": {"x":65,"y":45}, "curve": {"x":69,"y":40}, "corners": "round", "thickness": weight ===  "bold" ? 6 : 3 } }] }),
       
    };
  
    customElements.define("articulator-icon", ArticulatorElement);

    // Global Helper Functions
    window.Articulator = {
      listIcons: () => Object.keys(ArticulatorLibrary),
    };
    
    
    
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
  })();

  
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
                  title:      " =========Available(46) icons ===================  This is the list of all available icons at the moment: ",
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
          weighticon: attributes.weighticon ?? "outline",
          ariaLabel: attributes.ariaLabel ?? null
        },
  
        resources: {
          media: {
            iconGallery:
              "https://example.com/articulator/icons",
            designPreviews:
              "https://example.com/articulator/media"
          },
  
          documentation: {
            usageGuide:
              "https://example.com/docs/articulator-icon",
            apiReference:
              "https://example.com/docs/articulator-icon/api"
          },
  
          licensing: {
            iconLibrary:
              "https://example.com/licenses/articulator-icons",
            componentCode:
              "https://opensource.org/licenses/MIT"
          },
  
          policies: {
            accessibility:
              "https://www.w3.org/WAI/WCAG21/Understanding/",
            privacy:
              "https://example.com/policies/privacy",
            security:
              "https://example.com/policies/security"
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
      console.log("Articulator Feedback sent:", msg);
      // Example: send to your API
      // fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ msg })
      // });
    }
  };
  
