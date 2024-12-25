let directed = false; // Biến trạng thái cho đồ thị có hướng

// Hàm cập nhật trạng thái của đồ thị có hướng
function updateDirected() {
    directed = document.getElementById('directed').checked;
    drawGraph(graph); 
    drawGraphDS(graph, path, directed);

}
 
// Hàm chuyển đổi danh sách cạnh thành đồ thị dạng JSON
function convertEdgeListToJson(edgeList) {
    let graph = {};

    edgeList.forEach(edge => {
        const [node1, node2, weight] = edge.split(' ');

        // Kiểm tra và tạo node1 nếu chưa có trong graph
        if (!graph[node1]) {
            graph[node1] = {};
        }

        // Kiểm tra và tạo node2 nếu chưa có trong graph
        if (!graph[node2]) {
            graph[node2] = {};
        }

        // Thêm cạnh từ node1 -> node2
        graph[node1][node2] = parseInt(weight, 10);

        // Nếu đồ thị là vô hướng, thêm cạnh ngược lại node2 -> node1
        if (!directed) {
            graph[node2][node1] = parseInt(weight, 10);
        }
    });

    return graph;
}

// Hàm vẽ các đỉnh trên canvas
function drawNodes(ctx, nodePositions, nodeRadius) {
    ctx.lineWidth = 2; // Độ dày của đường viền
    for (let node in nodePositions) {
        const { x, y } = nodePositions[node];

        // Vẽ đường viền cho đỉnh
        ctx.strokeStyle = '#6666FF'; // Màu đường viền
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius + 10, 0, 2 * Math.PI);
        ctx.stroke();

        // Vẽ màu bên trong đỉnh
        ctx.fillStyle = '#6633FF'; // Màu bên trong đỉnh
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius + 8, 0, 2 * Math.PI); // Vẽ vòng tròn nhỏ hơn để tạo hiệu ứng viền
        ctx.fill();

        // Vẽ tên đỉnh
        ctx.fillStyle = '#fff'; // Màu văn bản
        ctx.font = '21px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node, x, y);
    }
}

// // Hàm vẽ cạnh và đỉnh (ở trên) đồ thị trên canvas
function drawGraph(graph) {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');

    // Xóa canvas trước khi vẽ đồ thị mới
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nodeRadius = 20;
    const nodePositions = {};
    const width = canvas.width;
    const height = canvas.height;
    const angleIncrement = (2 * Math.PI) / Object.keys(graph).length;
    const nodes = Object.keys(graph);
    const drawnEdges = new Set(); // Set để theo dõi các cạnh đã vẽ
    
    // Tính toán vị trí của các đỉnh trên canvas theo hình tròn
    nodes.forEach((node, index) => {
        const x = width / 2 + Math.cos(angleIncrement * index) * (width / 3);
        const y = height / 2 + Math.sin(angleIncrement * index) * (height / 3);
        nodePositions[node] = { x, y };
    });

    // Vẽ các cạnh (vô hướng hoặc có hướng)
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#333';
    for (let node in graph) {
        for (let neighbor in graph[node]) {
            const weight = graph[node][neighbor];

            // Kiểm tra nếu cạnh đã được vẽ (tránh vẽ lại)
            const edge = (node < neighbor) ? `${node}-${neighbor}` : `${neighbor}-${node}`;
            if (drawnEdges.has(edge)) {
                continue;
            }
            drawnEdges.add(edge);

            const { x: x1, y: y1 } = nodePositions[node];
            const { x: x2, y: y2 } = nodePositions[neighbor];

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // Vẽ trọng số cạnh
            ctx.fillStyle = '#333333'; // Màu chữ cho trọng số
            ctx.font = '21px Arial'; // Cỡ chữ

            const t = 3 / 5;

            // Tọa độ của trọng số tại vị trí 3/5 của cạnh
            const midX = x1 + t * (x2 - x1);
            const midY = y1 + t * (y2 - y1);

            // Tính kích thước của ô vuông (kích thước này có thể thay đổi tuỳ theo độ dài của trọng số)
            const padding = 5; // Khoảng cách từ trọng số tới biên ô vuông
            const textWidth = ctx.measureText(weight).width; // Đo chiều rộng của trọng số
            const boxWidth = textWidth + padding * 2; // Chiều rộng ô vuông
            const boxHeight = 20; // Chiều cao ô vuông (cố định)

            ctx.fillStyle = '#87CEFF'; // Màu nền xanh cho ô vuông
            ctx.fillRect(midX - boxWidth / 2, midY - boxHeight / 2, boxWidth, boxHeight); // Vẽ hình chữ nhật (ô vuông)

            ctx.fillStyle = '#333';
            ctx.fillText(weight, midX - textWidth / 2, midY + 5); // Vẽ trọng số vào ô vuông


            // Vẽ mũi tên nếu đồ thị có hướng
            if (directed) {
                const arrowSize = 27; // Kích thước mũi tên
                const angle = Math.atan2(y2 - y1, x2 - x1);
                const arrowStartX = x2 - arrowSize * Math.cos(angle);
                const arrowStartY = y2 - arrowSize * Math.sin(angle);

                // Vẽ đầu mũi tên
                ctx.beginPath();
                ctx.moveTo(arrowStartX, arrowStartY);
                ctx.lineTo(
                    arrowStartX - arrowSize * Math.cos(angle - Math.PI / 6),
                    arrowStartY - arrowSize * Math.sin(angle - Math.PI / 6)
                );
                ctx.lineTo(
                    arrowStartX - arrowSize * Math.cos(angle + Math.PI / 6),
                    arrowStartY - arrowSize * Math.sin(angle + Math.PI / 6)
                );
                ctx.lineTo(arrowStartX, arrowStartY);
                ctx.closePath();
                ctx.fillStyle = '#333';
                ctx.fill();
            }
        }

    }

    // Vẽ các đỉnh
    drawNodes(ctx, nodePositions, nodeRadius);
}


// ================= vẽ đồ thị =========================

// Hàm vẽ đồ thị nếu danh sách cạnh nhập vào hợp lệ
function drawGraphIfValid() {
    const edgesInput = document.getElementById('edges').value.trim();

    // Chuyển đổi chuỗi đầu vào thành mảng danh sách cạnh
    const edges = edgesInput.split('\n').map(line => line.trim()).filter(Boolean);
    if (edges.length === 0) {
        document.getElementById('result').textContent = 'Danh sách cạnh không hợp lệ.';
        return;
    }

    try {
        const graph = convertEdgeListToJson(edges);
        // Kiểm tra nếu đồ thị có ít nhất một đỉnh để vẽ
        if (Object.keys(graph).length === 0) {
            document.getElementById('result').textContent = 'Đồ thị không có đỉnh nào.';
            return;
        }

        // Vẽ đồ thị
        drawGraph(graph);
        document.getElementById('result').textContent = 'Đồ thị đã được vẽ thành công.';
    } catch (e) {
        document.getElementById('result').textContent = 'Dữ liệu đồ thị không hợp lệ. Hãy nhập đúng định dạng danh sách cạnh.';
    }
}



// =================== 2 thuật toán chính ======
function dijkstra(graph, start, end) {
    let distances = {}, previous = {}, unvisited = new Set();
    for (let node in graph) {
        distances[node] = node === start ? 0 : Infinity;
        unvisited.add(node);
    }

    while (unvisited.size) {
        let closestNode = null;
        for (let node of unvisited) {
            if (!closestNode || distances[node] < distances[closestNode]) {
                closestNode = node;
            }
        }

        if (distances[closestNode] === Infinity) break;
        if (closestNode === end) break;

        for (let neighbor in graph[closestNode]) {
            let newDistance = distances[closestNode] + graph[closestNode][neighbor];
            if (newDistance < distances[neighbor]) {
                distances[neighbor] = newDistance;
                previous[neighbor] = closestNode;
            }
        }
        unvisited.delete(closestNode);
    }

    let path = [], node = end;
    while (node) {
        path.push(node);
        node = previous[node];
    }
    return path.reverse();
}

function prim(graph, start) {
    const V = Object.keys(graph).length; // Số lượng đỉnh
    const visited = new Array(V).fill(false);  // Mảng đánh dấu các đỉnh đã được chọn
    const mstEdges = [];  // Mảng chứa các cạnh của cây khung nhỏ nhất (MST)
    let totalWeight = 0;
    // Khởi tạo đỉnh bắt đầu
    visited[start] = true;

    // Vòng lặp chạy khi số cạnh trong cây khung nhỏ nhất chưa đủ n-1
    while (mstEdges.length < V - 1) {
        let minEdge = null;
        let minWeight = Infinity;

        // Tìm cạnh có trọng số nhỏ nhất giữa các đỉnh đã thăm và chưa thăm
        for (let u = 0; u < V; u++) {
            if (visited[u]) {
                for (let v = 0; v < V; v++) {
                    if (!visited[v] && graph[u][v] !== 0) {
                        // Kiểm tra xem cạnh u-v có trọng số nhỏ hơn trọng số tối thiểu không
                        if (graph[u][v] < minWeight) {
                            minWeight = graph[u][v];
                            minEdge = { u, v, weight: minWeight };
                        }
                    }
                }
            }
        }

        // Thêm cạnh nhỏ nhất vào cây khung
        if (minEdge !== null) {
            mstEdges.push(minEdge);

            // Cộng trọng số của cạnh vào tổng trọng số
            totalWeight += minEdge.weight;

            // Đánh dấu đỉnh v đã thăm
            visited[minEdge.v] = true;
        }
    }

    // Trả về các cạnh trong cây khung
    return mstEdges;
}
  
//====================== tìm và vẽ đường đi ngắn nhất ================

// viết kết quả của thuật toán dijkstra
function findShortestPath() {
    const start = document.getElementById('start').value.trim();
    const end = document.getElementById('end').value.trim();
    const edgesInput = document.getElementById('edges').value.trim();

    // Chuyển đổi chuỗi đầu vào thành mảng danh sách cạnh
    const edges = edgesInput.split('\n').map(line => line.trim()).filter(Boolean);
    if (edges.length === 0) {
        document.getElementById('result').textContent = 'Danh sách cạnh không hợp lệ.';
        return;
    }

    try {
        const graph = convertEdgeListToJson(edges);
        if (!graph[start] || !graph[end]) {
            document.getElementById('result').textContent = 'Điểm bắt đầu hoặc kết thúc không tồn tại trong đồ thị.';
            return;
        }

        const path = dijkstra(graph, start, end);
        if (path.length === 1) {
            document.getElementById('result').textContent = 'Không tìm thấy đường đi.';
        } else {
            // Tính tổng trọng lượng của đường đi ngắn nhất
            let totalWeight = 0;
            for (let i = 0; i < path.length - 1; i++) {
                const currentNode = path[i];
                const nextNode = path[i + 1];
                totalWeight += graph[currentNode][nextNode]; // Cộng trọng số của cạnh
            }

            document.getElementById('result').textContent = `Đường đi ngắn nhất từ ${start} đến ${end}: ${path.join(' -> ')}\nTổng trọng số: ${totalWeight}`;
        }   
        
    } catch (e) {
        document.getElementById('result').textContent = 'Dữ liệu đồ thị không hợp lệ. Hãy nhập đúng định dạng danh sách cạnh.';
    }
}

// vẽ cả đồ thị chèn đường đi ngắn nhất (màu đỏ bên trên)
function drawGraphDijkstra() {
    const start = document.getElementById('start').value.trim();
    const end = document.getElementById('end').value.trim();
    const edgesInput = document.getElementById('edges').value.trim();

    // Chuyển đổi chuỗi đầu vào thành mảng danh sách cạnh
    const edges = edgesInput.split('\n').map(line => line.trim()).filter(Boolean);
    if (edges.length === 0) {
        document.getElementById('result').textContent = 'Danh sách cạnh không hợp lệ.';
        return;
    }

    try {
        const graph = convertEdgeListToJson(edges);  // Chuyển danh sách cạnh thành đồ thị
        if (!graph[start] || !graph[end]) {
            document.getElementById('result').textContent = 'Điểm bắt đầu hoặc điểm kết thúc không tồn tại trong đồ thị.';
            return;
        }

        // Tìm đường đi ngắn nhất từ start đến end
        const path = dijkstra(graph, start, end);
        
        if (path === null) {
            document.getElementById('result').textContent = 'Không có đường đi từ điểm bắt đầu đến điểm kết thúc.';
        } else {
            // Vẽ đồ thị và đường đi ngắn nhất lên canvas
            drawGraphDS(graph, path);
            document.getElementById('result').textContent = `Đường đi ngắn nhất từ ${start} đến ${end} đã được vẽ.
(nếu không có đường màu đỏ nghĩa là không có đường đi ngắn nhất!!)`;
        }
    } catch (e) {
        document.getElementById('result').textContent = 'Dữ liệu đồ thị không hợp lệ. Hãy nhập đúng định dạng danh sách cạnh.';
    }
}

// vẽ đường đi ngắn nhất (màu đỏ)
function drawShortestPath(ctx, path, nodePositions) {
    if (path.length < 2) return;

    ctx.strokeStyle = '#e74c3c'; // Màu đỏ cho đường đi ngắn nhất
    ctx.lineWidth = 4;

    // Vẽ các đoạn đường trong đường đi ngắn nhất
    for (let i = 0; i < path.length - 1; i++) {
        const currentNode = path[i];
        const nextNode = path[i + 1];

        const currentPos = nodePositions[currentNode];
        const nextPos = nodePositions[nextNode];

        ctx.beginPath();
        ctx.moveTo(currentPos.x, currentPos.y);
        ctx.lineTo(nextPos.x, nextPos.y);
        ctx.stroke();
    }
}

// Hàm vẽ cạnh và đỉnh đồ thị
function drawGraphDS(graph, path) {
    const canvas3 = document.getElementById('graphCanvas3');
    const ctx = canvas3.getContext('2d');

    // Xóa canvas trước khi vẽ đồ thị mới
    ctx.clearRect(0, 0, canvas3.width, canvas3.height);

    const nodeRadius = 20;
    const nodePositions = {};
    const width = canvas3.width;
    const height = canvas3.height;
    const angleIncrement = (2 * Math.PI) / Object.keys(graph).length;
    const nodes = Object.keys(graph);
    const drawnEdges = new Set();

    // Tính toán vị trí của các đỉnh trên canvas3 theo hình tròn
    nodes.forEach((node, index) => {
        const x = width / 2 + Math.cos(angleIncrement * index) * (width / 3);
        const y = height / 2 + Math.sin(angleIncrement * index) * (height / 3);
        nodePositions[node] = { x, y };
    });

    // Vẽ các cạnh (vô hướng hoặc có hướng)
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#333';
    for (let node in graph) {
        for (let neighbor in graph[node]) {
            const weight = graph[node][neighbor];

            // Kiểm tra nếu cạnh đã được vẽ (tránh vẽ lại)
            const edge = (node < neighbor) ? `${node}-${neighbor}` : `${neighbor}-${node}`;
            if (drawnEdges.has(edge)) {
                continue;
            }
            drawnEdges.add(edge);

            const { x: x1, y: y1 } = nodePositions[node];
            const { x: x2, y: y2 } = nodePositions[neighbor];

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            /// Vẽ trọng số cạnh
            ctx.fillStyle = '#333333'; // Màu chữ cho trọng số
            ctx.font = '21px Arial'; // Cỡ chữ

            // Tính tọa độ trung điểm của cạnh
            const t = 3 / 5;

            // Tọa độ của trọng số tại vị trí 3/5 của cạnh
            const midX = x1 + t * (x2 - x1);
            const midY = y1 + t * (y2 - y1);

            // Tính kích thước của ô vuông (kích thước này có thể thay đổi tuỳ theo độ dài của trọng số)
            const padding = 5; // Khoảng cách từ trọng số tới biên ô vuông
            const textWidth = ctx.measureText(weight).width; // Đo chiều rộng của trọng số
            const boxWidth = textWidth + padding * 2; // Chiều rộng ô vuông
            const boxHeight = 20; // Chiều cao ô vuông (cố định)

            ctx.fillStyle = '#87CEFF'; // Màu nền xanh cho ô vuông
            ctx.fillRect(midX - boxWidth / 2, midY - boxHeight / 2, boxWidth, boxHeight); // Vẽ hình chữ nhật (ô vuông)

            ctx.fillStyle = '#333';
            ctx.fillText(weight, midX - textWidth / 2, midY + 5); // Vẽ trọng số vào ô vuông

            // Vẽ mũi tên nếu đồ thị có hướng
            if (directed) {
                const arrowSize = 27; // Kích thước mũi tên
                const angle = Math.atan2(y2 - y1, x2 - x1);
                const arrowStartX = x2 - arrowSize * Math.cos(angle);
                const arrowStartY = y2 - arrowSize * Math.sin(angle);

                // Vẽ đầu mũi tên
                ctx.beginPath();
                ctx.moveTo(arrowStartX, arrowStartY);
                ctx.lineTo(
                    arrowStartX - arrowSize * Math.cos(angle - Math.PI / 6),
                    arrowStartY - arrowSize * Math.sin(angle - Math.PI / 6)
                );
                ctx.lineTo(
                    arrowStartX - arrowSize * Math.cos(angle + Math.PI / 6),
                    arrowStartY - arrowSize * Math.sin(angle + Math.PI / 6)
                );
                ctx.lineTo(arrowStartX, arrowStartY);
                ctx.closePath();
                ctx.fillStyle = '#333';
                ctx.fill();
            }
        }
    }

    // Vẽ các đỉnh
    drawNodes(ctx, nodePositions, nodeRadius);

    // Vẽ đường đi ngắn nhất (nếu có)
    drawShortestPath(ctx, path, nodePositions);
}



// ============================== tìm và vẽ cây khung nhỏ nhất ==================

// hàm đổi ds cạnh thành ma trận trọng số
function convertEdgeListToMatrix(edgeList) {
    const n = Math.max(...edgeList.map(e => Math.max(e.from, e.to))) + 1; // Xác định số lượng đỉnh
    const matrix = Array(n).fill().map(() => Array(n).fill(0)); // Tạo ma trận trọng số 0

    // Cập nhật ma trận trọng số từ danh sách cạnh
    edgeList.forEach(({ from, to, weight }) => {
        matrix[from][to] = weight;
        matrix[to][from] = weight; // Nếu đồ thị vô hướng
    });

    return matrix;
}

//trình bày kết quả Prim
function printMinimumSpanningTree() {
    const start = document.getElementById('start').value.trim(); 
    const edgesInput = document.getElementById('edges').value.trim();

    // Chuyển đổi chuỗi đầu vào thành mảng danh sách cạnh
    const edges = edgesInput.split('\n').map(line => line.trim()).filter(Boolean);
    if (edges.length === 0) {
        document.getElementById('result2').textContent = 'Danh sách cạnh không hợp lệ.';
        return;
    }

    try {
        // Tạo ánh xạ từ đỉnh (ký tự hoặc số) thành chỉ số duy nhất
        const vertexMap = new Map();
        let vertexIndex = 0;
        const edgeList = edges.map(edge => {
            const [from, to, weight] = edge.split(' ').map(e => e.trim());
            if (!vertexMap.has(from)) vertexMap.set(from, vertexIndex++);
            if (!vertexMap.has(to)) vertexMap.set(to, vertexIndex++);
            return { from: vertexMap.get(from), to: vertexMap.get(to), weight: parseInt(weight) };
        });

        const graph = convertEdgeListToMatrix(edgeList);

        // Chuyển đỉnh bắt đầu từ ký tự/số sang chỉ số
        const startIndex = vertexMap.get(start);

        // Gọi thuật toán Prim
        const mstEdges = prim(graph, startIndex);

        // Tạo mảng chứa các cạnh theo định dạng "from->to"
        const mstEdgeStrings = mstEdges.map(edge => {
            const fromVertex = [...vertexMap].find(([key, value]) => value === edge.u)[0];
            const toVertex = [...vertexMap].find(([key, value]) => value === edge.v)[0];
            return `${fromVertex}->${toVertex}`;
        });

        // Tính tổng trọng số của cây khung nhỏ nhất
        const totalWeight = mstEdges.reduce((sum, edge) => sum + edge.weight, 0);

        // Hiển thị kết quả
        document.getElementById('result2').textContent = 
            `Cây khung nhỏ nhất: ${mstEdgeStrings.join(', ')}\nTổng trọng số: ${totalWeight}`;
    } catch (e) {
        document.getElementById('result2').textContent = 'Dữ liệu đồ thị không hợp lệ. Hãy nhập đúng định dạng danh sách cạnh.';
    }
}

//in cây khung nhỏ nhất
function findMinimumSpanningTree() {
    const start = document.getElementById('start').value.trim();
    const edgesInput = document.getElementById('edges').value.trim();

    // Chuyển đổi chuỗi đầu vào thành mảng danh sách cạnh
    const edges = edgesInput.split('\n').map(line => line.trim()).filter(Boolean);
    if (edges.length === 0) {
        document.getElementById('result2').textContent = 'Danh sách cạnh không hợp lệ.';
        return;
    }
    
    try {
        // Tạo ánh xạ từ đỉnh (ký tự hoặc số) thành chỉ số duy nhất
        const vertexMap = new Map();
        let vertexIndex = 0;
        
        const edgeList = edges.map(edge => {
            const [from, to, weight] = edge.split(' ').map(e => e.trim());
            if (!vertexMap.has(from)) vertexMap.set(from, vertexIndex++);
            if (!vertexMap.has(to)) vertexMap.set(to, vertexIndex++);
            return { from: vertexMap.get(from), to: vertexMap.get(to), weight: parseInt(weight) };
        });
        
        // Chuyển danh sách cạnh thành ma trận trọng số
        const graph = convertEdgeListToMatrix(edgeList);

        // Chuyển đỉnh bắt đầu từ ký tự/số sang chỉ số
        const startIndex = vertexMap.get(start);

        // Gọi thuật toán Prim
        const mstEdges = prim(graph, startIndex);

        drawGraphPrim(graph, mstEdges);

        document.getElementById('result2').textContent = 'Cây khung nhỏ nhất đã được vẽ.';
    } catch (e) {
        document.getElementById('result2').textContent = 'Dữ liệu đồ thị không hợp lệ. Hãy nhập đúng định dạng danh sách cạnh.';
    }
}

//hàm vẽ cây khung nhỏ nhất 
function drawGraphPrim(graph, minSpanningTree) {
    const canvas2 = document.getElementById('graphCanvas2');
    const ctx = canvas2.getContext('2d');

    // Xóa canvas trước khi vẽ đồ thị mới
    ctx.clearRect(0, 0, canvas2.width, canvas2.height);

    const nodeRadius = 20;
    const nodePositions = {};
    const width = canvas2.width;
    const height = canvas2.height;
    const angleIncrement = (2 * Math.PI) / graph.length;
    const nodes = Object.keys(graph);
    const drawnEdges = new Set();

    // Tính toán vị trí của các đỉnh trên canvas theo hình tròn
    nodes.forEach((node, index) => {
        const x = width / 2 + Math.cos(angleIncrement * index) * (width / 3);
        const y = height / 2 + Math.sin(angleIncrement * index) * (height / 3);
        nodePositions[node] = { x, y };
    });

    // Vẽ các cạnh của cây khung (nếu có)
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#333';

    if (minSpanningTree) {
        // Draw edges of the MST
        minSpanningTree.forEach(edge => {
            const { u, v, weight } = edge;

            const { x: x1, y: y1 } = nodePositions[u];
            const { x: x2, y: y2 } = nodePositions[v];

            // Vẽ cạnh chỉ nếu chưa vẽ
            const edgeKey = (u < v) ? `${u}-${v}` : `${v}-${u}`;
            if (!drawnEdges.has(edgeKey)) {
                drawnEdges.add(edgeKey);

                // Vẽ cạnh
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                // Vẽ trọng số
                ctx.fillStyle = '#333333'; // Màu chữ cho trọng số
                ctx.font = '21px Arial'; // Cỡ chữ

                const t = 3 / 5;
                const midX = x1 + t * (x2 - x1);
                const midY = y1 + t * (y2 - y1);
                const padding = 5;
                const textWidth = ctx.measureText(weight).width;
                const boxWidth = textWidth + padding * 2;
                const boxHeight = 20;

                ctx.fillStyle = '#87CEFF'; // Màu nền xanh cho ô vuông
                ctx.fillRect(midX - boxWidth / 2, midY - boxHeight / 2, boxWidth, boxHeight);

                ctx.fillStyle = '#333';
                ctx.fillText(weight, midX - textWidth / 2, midY + 5);
            }
        });
    }
    const edgesInput = document.getElementById('edges').value.trim();

    // Chuyển đổi chuỗi đầu vào thành mảng danh sách cạnh
    const edges = edgesInput.split('\n').map(line => line.trim()).filter(Boolean);
    if (edges.length === 0) {
        document.getElementById('result').textContent = 'Danh sách cạnh không hợp lệ.';
        return;
    }

    const graph1 = convertEdgeListToJson(edges);
    // Kiểm tra nếu đồ thị có ít nhất một đỉnh để vẽ
    if (Object.keys(graph1).length === 0) {
        document.getElementById('result').textContent = 'Đồ thị không có đỉnh nào.';
        return;
    }

    drawNodesOnly(graph1);
}

//hàm chỉ vẽ lại các đỉnh 
//(vì hàm prim duyệt bằng chỉ số nên sẽ hiển thị đỉnh bị đổi, 
// vì thế cần hàm này để vẽ hiển thị lại các đỉnh theo đề bài)
function drawNodesOnly(graph) {
    const canvas2 = document.getElementById('graphCanvas2');
    const ctx = canvas2.getContext('2d');

    const nodeRadius = 20;
    const nodePositions = {};
    const width = canvas2.width;
    const height = canvas2.height;
    const angleIncrement = (2 * Math.PI) / Object.keys(graph).length;
    const nodes = Object.keys(graph);

    // Tính toán vị trí của các đỉnh trên canvas theo hình tròn
    nodes.forEach((node, index) => {
        const x = width / 2 + Math.cos(angleIncrement * index) * (width / 3);
        const y = height / 2 + Math.sin(angleIncrement * index) * (height / 3);
        nodePositions[node] = { x, y };
    });

    // Vẽ các đỉnh
    drawNodes(ctx, nodePositions, nodeRadius);
}
