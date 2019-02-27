

let markers = [];

document.querySelectorAll('[sub-marker]').forEach((el) => {
    let params = el.getAttribute('sub-marker').split(' ');

    el.offsetX = Number(params[0]);
    el.offsetY = Number(params[1]);

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

    let offsetX = 0;
    let offsetY = 0;

    markers.forEach((el) => {

        if (el.object3D.visible === false) return;

        px += el.object3D.position.x;
        py += el.object3D.position.y;
        pz += el.object3D.position.z;
        rx += el.object3D.rotation.x;
        ry += el.object3D.rotation.y;
        rz += el.object3D.rotation.z;

        offsetX += el.offsetX;
        offsetY += el.offsetY;

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

        center_offset.object3D.position.x = -offsetX/count - 0.5;
        center_offset.object3D.position.z = offsetY/count + 0.5;
    }
});