// Solver Tree Coordinates and Cache
let treeNodesList = [];
let leafCount = 0;
let nodeIdCounter = 0;
let maxTreeDepth = 5;

function layoutTree(node, depth = 0, parentId = null) {
    const id = "node-" + (nodeIdCounter++);
    
    const targetWords = new Set();
    if (node.guess) {
        targetWords.add(node.guess);
    }
    
    const children = [];
    let isLeaf = true;
    
    if (node.branches) {
        for (const key in node.branches) {
            const child = node.branches[key];
            if (child === "solved") {
                // Resolved at this guess
            } else if (child) {
                isLeaf = false;
                const childNode = layoutTree(child, depth + 1, id);
                children.push(childNode);
                for (const w of childNode.targetWords) {
                    targetWords.add(w);
                }
            }
        }
    }
    
    let angleIndex = 0;
    let minLeaf = 0;
    let maxLeaf = 0;
    
    if (isLeaf) {
        angleIndex = leafCount;
        minLeaf = leafCount;
        maxLeaf = leafCount;
        leafCount++;
    } else {
        // Find min and max leaf indices in children sub-trees
        minLeaf = Math.min(...children.map(c => c.minLeaf));
        maxLeaf = Math.max(...children.map(c => c.maxLeaf));
        angleIndex = (minLeaf + maxLeaf) / 2;
    }
    
    const r = depth * (maxTreeDepth > 0 ? (230 / maxTreeDepth) : 40);
    
    const nodeData = {
        id,
        guess: node.guess,
        angleIndex,
        minLeaf,
        maxLeaf,
        r_radius: r,
        x: 0, // Computed in second pass
        y: 0, // Computed in second pass
        parentId,
        isLeaf,
        targetWords
    };
    
    treeNodesList.push(nodeData);
    return nodeData;
}

function renderTreeSVG() {
    const container = document.getElementById("tree-container");
    if (!container) return;
    
    container.style.display = "block";
    container.style.padding = "0";
    container.style.overflow = "hidden";
    container.innerHTML = "";
    
    const wrapper = document.createElement("div");
    wrapper.className = "tree-scroll-wrapper";
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 500 500");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.display = "block";
    
    const linesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const circlesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const overlayGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    overlayGroup.id = "tree-overlay-group";
    
    // Draw all lines first so they are behind circles
    for (const node of treeNodesList) {
        if (node.parentId) {
            const parent = treeNodesList.find(n => n.id === node.parentId);
            if (parent) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", parent.x);
                line.setAttribute("y1", parent.y);
                line.setAttribute("x2", node.x);
                line.setAttribute("y2", node.y);
                line.setAttribute("stroke", "#451a1d"); // Default to impossible color (dark crimson)
                line.setAttribute("stroke-width", "0.5");
                line.setAttribute("class", "tree-line");
                line.id = `line-${node.id}`;
                linesGroup.appendChild(line);
                node.domLine = line;
            }
        }
    }
    
    // Draw all circles
    for (const node of treeNodesList) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", node.x);
        circle.setAttribute("cy", node.y);
        const r = node.parentId === null ? 5.5 : (node.isLeaf ? 1.5 : 2.5);
        circle.setAttribute("r", r);
        circle.setAttribute("fill", "#374151"); // Default to impossible color (gray)
        circle.setAttribute("class", "tree-circle");
        circle.id = `circle-${node.id}`;
        
        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = node.guess.toUpperCase();
        circle.appendChild(title);
        
        circlesGroup.appendChild(circle);
        node.domCircle = circle;
    }
    
    svg.appendChild(linesGroup);
    svg.appendChild(circlesGroup);
    svg.appendChild(overlayGroup);
    wrapper.appendChild(svg);
    container.appendChild(wrapper);
}

function updateTreeVisualization() {
    if (treeNodesList.length === 0) return;
    
    const remaining = activeTab === "play" ? remainingWords : sandboxRemainingWords;
    const remainingSet = new Set(remaining);
    
    let activeX = null;
    let activeY = null;
    let activeR = null;
    
    for (const node of treeNodesList) {
        let possible = false;
        
        // Fast intersection check
        if (node.targetWords.size < remainingSet.size) {
            for (const w of node.targetWords) {
                if (remainingSet.has(w)) {
                    possible = true;
                    break;
                }
            }
        } else {
            for (const w of remainingSet) {
                if (node.targetWords.has(w)) {
                    possible = true;
                    break;
                }
            }
        }
        
        if (node.domCircle) {
            if (possible) {
                node.domCircle.setAttribute("fill", "#10b981"); // Vibrant green
                node.domCircle.setAttribute("stroke", "rgba(16, 185, 129, 0.4)");
                node.domCircle.setAttribute("stroke-width", "2");
                
                const rec = activeTab === "play" ? getRecommendedGuess() : getSandboxRecommendedGuess();
                if (rec && node.guess === rec) {
                    // Choose the highest node (closest to root/smallest radius)
                    if (activeR === null || node.r_radius < activeR) {
                        activeX = node.x;
                        activeY = node.y;
                        activeR = node.r_radius;
                    }
                }
            } else {
                node.domCircle.setAttribute("fill", "#451a1d"); // Muted dark red/crimson
                node.domCircle.setAttribute("stroke", "none");
            }
        }
        
        if (node.domLine) {
            if (possible) {
                node.domLine.setAttribute("stroke", "#10b981"); // Vibrant green
                node.domLine.setAttribute("stroke-width", "1.5");
            } else {
                node.domLine.setAttribute("stroke", "#451a1d"); // Muted dark red/crimson
                node.domLine.setAttribute("stroke-width", "0.5");
            }
        }
    }
    
    // Draw pulsing highlight overlay on active node
    const overlay = document.getElementById("tree-overlay-group");
    if (overlay) {
        overlay.innerHTML = "";
        if (activeX !== null && activeY !== null) {
            // Breathing underlay glow
            const glow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            glow.setAttribute("cx", activeX);
            glow.setAttribute("cy", activeY);
            glow.setAttribute("r", "14");
            glow.setAttribute("fill", "#10b981");
            glow.setAttribute("class", "tree-node-glow");
            overlay.appendChild(glow);
            
            // Pulse ring 1
            const pulse1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            pulse1.setAttribute("cx", activeX);
            pulse1.setAttribute("cy", activeY);
            pulse1.setAttribute("fill", "none");
            pulse1.setAttribute("stroke", "#10b981");
            pulse1.setAttribute("class", "tree-pulse-ring");
            overlay.appendChild(pulse1);
            
            // Pulse ring 2
            const pulse2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            pulse2.setAttribute("cx", activeX);
            pulse2.setAttribute("cy", activeY);
            pulse2.setAttribute("fill", "none");
            pulse2.setAttribute("stroke", "#10b981");
            pulse2.setAttribute("class", "tree-pulse-ring-2");
            overlay.appendChild(pulse2);
            
            // Active recommended center dot overlay (for solid glow)
            const centerDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            centerDot.setAttribute("cx", activeX);
            centerDot.setAttribute("cy", activeY);
            centerDot.setAttribute("r", "5.5"); // Slightly larger than default
            centerDot.setAttribute("fill", "#10b981");
            centerDot.setAttribute("stroke", "#ffffff");
            centerDot.setAttribute("stroke-width", "1.5");
            centerDot.style.filter = "drop-shadow(0 0 4px #10b981)";
            overlay.appendChild(centerDot);
        }
    }
}
