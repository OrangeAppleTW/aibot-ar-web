// 眼算法概念
// 所有的標記去試圖計算中心點的位置&轉向
// 平均所有可以識別的標記所計算的結果

let markers = [];

document.querySelectorAll('[sub-marker]').forEach((el) => {
    let params = el.getAttribute('sub-marker').split(' ');
    let plane = document.createElement('a-entity');
    plane.setAttribute('position', `${-Number(params[0])} 0 ${-Number(params[1])}`);
    plane.setAttribute('anchor', 'true');
    el.appendChild(plane);

    markers.push(el);
});

let PX = 0;
let PY = 0;
let PZ = 0;
let RX = 0;
let RY = 0;
let RZ = 0;

setInterval(function () {
    let px = 0;
    let py = 0;
    let pz = 0;
    let rx = 0;
    let ry = 0;
    let rz = 0;
    let count = 0;

    markers.forEach((el) => {

        if (el.object3D.visible == false) return;

        var pos = new THREE.Vector3();
        pos.setFromMatrixPosition(el.querySelector('[anchor]').object3D.matrixWorld);

        px += pos.x;
        py += pos.y;
        pz += pos.z;
        rx += el.object3D.rotation.x;
        ry += el.object3D.rotation.y;
        rz += el.object3D.rotation.z;

        count++;
    });

    center.object3D.visible = count > 0;
    if (count > 0) {
        PX = PX * 0.9 + px * 0.1 / count;
        PY = PY * 0.9 + py * 0.1 / count;
        PZ = PZ * 0.9 + pz * 0.1 / count;
        RX = RX * 0.9 + rx * 0.1 / count;
        RY = RY * 0.9 + ry * 0.1 / count;
        RZ = RZ * 0.9 + rz * 0.1 / count;

        center.object3D.position.x = PX;
        center.object3D.position.y = PY;
        center.object3D.position.z = PZ;
        center.object3D.rotation.x = RX;
        center.object3D.rotation.y = RY;
        center.object3D.rotation.z = RZ;
    }
});