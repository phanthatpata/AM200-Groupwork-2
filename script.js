// 1. ข้อมูลกราฟสำหรับการคำนวณ (Dijkstra)
const graph = {
    'A': { 'B': 2, 'C': 4, 'D': 6 },
    'B': { 'A': 2, 'C': 1, 'D': 7, 'E': 3 },
    'C': { 'A': 4, 'B': 1, 'D': 4, 'E': 2 },
    'D': { 'A': 6, 'B': 7, 'C': 4, 'E': 1, 'F': 5 },
    'E': { 'B': 3, 'C': 2, 'D': 1, 'F': 5 },
    'F': { 'D': 5, 'E': 5 }
};

// 2. ข้อมูลสำหรับการวาดแผนที่ (Canvas)
const nodePos = {
    'A': { x: 200, y: 30 },
    'B': { x: 320, y: 80 },
    'C': { x: 80, y: 80 },
    'D': { x: 200, y: 160 },
    'E': { x: 320, y: 220 },
    'F': { x: 200, y: 270 }
};

const mapEdges = [
    ['A','B', 2], ['A','C', 4], ['A','D', 6],
    ['B','C', 1], ['B','D', 7], ['B','E', 3],
    ['C','D', 4], ['C','E', 2],
    ['D','E', 1], ['D','F', 5],
    ['E','F', 5]
];

// 3. ฟังก์ชันวาดแผนที่
function drawMap(highlightPath = []) {
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    function isEdgeInPath(u, v) {
        for(let i = 0; i < highlightPath.length - 1; i++) {
            if((highlightPath[i] === u && highlightPath[i+1] === v) ||
               (highlightPath[i] === v && highlightPath[i+1] === u)) {
                return true;
            }
        }
        return false;
    }

    // วาดเส้น (Edges)
    mapEdges.forEach(edge => {
        const [u, v, weight] = edge;
        const isHighlight = isEdgeInPath(u, v);
        
        ctx.beginPath();
        ctx.moveTo(nodePos[u].x, nodePos[u].y);
        ctx.lineTo(nodePos[v].x, nodePos[v].y);
        ctx.strokeStyle = isHighlight ? '#e74c3c' : '#bdc3c7'; 
        ctx.lineWidth = isHighlight ? 4 : 2;
        ctx.stroke();

        // หาจุดกึ่งกลางของเส้น
        let midX = (nodePos[u].x + nodePos[v].x) / 2;
        let midY = (nodePos[u].y + nodePos[v].y) / 2;
        
        // แก้ปัญหาตัวเลขทับซ้อนกัน
        if ((u === 'A' && v === 'D') || (u === 'D' && v === 'A')) {
            midX += 15; // ขยับเลข 6 (A-D) ไปทางขวา
        }
        if ((u === 'B' && v === 'C') || (u === 'C' && v === 'B')) {
            midY -= 15; // ขยับเลข 1 (B-C) ขึ้นด้านบน
        }
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(midX - 8, midY - 10, 16, 16); 
        
        ctx.fillStyle = isHighlight ? '#c0392b' : '#7f8c8d';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(weight, midX, midY - 2);
    });

    // วาดจุด (Nodes)
    for (let node in nodePos) {
        const isHighlight = highlightPath.includes(node);
        
        ctx.beginPath();
        ctx.arc(nodePos[node].x, nodePos[node].y, 18, 0, 2 * Math.PI);
        ctx.fillStyle = isHighlight ? '#f1c40f' : '#ffffff'; 
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = isHighlight ? '#d35400' : '#2c3e50';
        ctx.stroke();
        
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node, nodePos[node].x, nodePos[node].y);
    }
}

// 4. อัลกอริทึมหาระยะทางที่สั้นที่สุด
function dijkstra(graph, start, end) {
    let distances = {};
    let prev = {};
    let unvisited = new Set(Object.keys(graph));

    for (let node of unvisited) {
        distances[node] = Infinity;
        prev[node] = null;
    }
    distances[start] = 0;

    while (unvisited.size > 0) {
        let currNode = null;
        let minDistance = Infinity;
        
        for (let node of unvisited) {
            if (distances[node] < minDistance) {
                minDistance = distances[node];
                currNode = node;
            }
        }

        if (currNode === null || currNode === end) break;
        unvisited.delete(currNode);

        for (let neighbor in graph[currNode]) {
            if (unvisited.has(neighbor)) {
                let newDist = distances[currNode] + graph[currNode][neighbor];
                if (newDist < distances[neighbor]) {
                    distances[neighbor] = newDist;
                    prev[neighbor] = currNode;
                }
            }
        }
    }

    let path = [];
    let curr = end;
    while (curr !== null) {
        path.unshift(curr);
        curr = prev[curr];
    }

    return { 
        distance: distances[end], 
        path: distances[end] === Infinity ? [] : path 
    };
}

// 5. ควบคุมการทำงานของหน้าเว็บ
function calculateRoute() {
    const startNode = document.getElementById('start').value;
    const endNode = document.getElementById('end').value;

    if (startNode === endNode) {
        alert("จุดต้นทางและปลายทางเป็นจุดเดียวกัน กรุณาเลือกใหม่");
        return;
    }

    const result = dijkstra(graph, startNode, endNode);

    document.getElementById('distance-output').innerHTML = `<strong>ระยะทางรวมที่สั้นที่สุด:</strong> ${result.distance} หน่วย`;
    document.getElementById('path-output').innerHTML = `<strong>เส้นทางการเดินทาง:</strong> ${result.path.join(' ➔ ')}`;

    // วาดแผนที่ใหม่พร้อมไฮไลท์เส้นทาง
    drawMap(result.path);

    document.getElementById('input-section').classList.add('hidden');
    document.getElementById('result-section').classList.remove('hidden');
}

function resetApp() {
    document.getElementById('result-section').classList.add('hidden');
    document.getElementById('input-section').classList.remove('hidden');
    drawMap([]); 
}

function exitApp() {
    document.getElementById('result-section').classList.add('hidden');
    document.getElementById('exit-section').classList.remove('hidden');
    document.querySelector('.map-container').classList.add('hidden');
}

// วาดแผนที่ตั้งต้นเมื่อเปิดเว็บครั้งแรก
window.onload = function() {
    drawMap([]);
};