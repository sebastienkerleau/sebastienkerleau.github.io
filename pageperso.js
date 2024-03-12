const radius1 = document.getElementById('radius1');
const radius2 = document.getElementById('radius2');
const radius3 = document.getElementById('radius3');
const radius4 = document.getElementById('radius4');
const vectorV = document.getElementById('vectorV');
const pssCheckText = document.getElementById('pssCheck');
const svg = document.getElementById('svgContainer');

function getSVGCoordinates(event) {
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function updateRadius(radius, x, y) {
  radius.setAttribute('x2', x);
  radius.setAttribute('y2', y);
  calculateAnglesAndCheckPSS();
}
let cosHalfM = 12345;
function calculateAnglesAndCheckPSS() {
  const vectors = [radius1, radius2, radius3, radius4];
  const angles = [];

  const vX = parseFloat(vectorV.getAttribute('x2')) - parseFloat(vectorV.getAttribute('x1'));
  const vY = parseFloat(vectorV.getAttribute('y2')) - parseFloat(vectorV.getAttribute('y1'));

  for (let i = 0; i < vectors.length; i++) {
    const xX = parseFloat(vectors[i].getAttribute('x2')) - parseFloat(vectors[i].getAttribute('x1'));
    const xY = parseFloat(vectors[i].getAttribute('y2')) - parseFloat(vectors[i].getAttribute('y1'));

    let angle = Math.atan2(xY, xX) - Math.atan2(vY, vX);
    angle = (angle * 180) / Math.PI;

    if (angle < 0) {
      angle += 360;
    }

    angles.push(angle.toFixed(2));


    
  }

  angles.sort((a, b) => a - b);

  const a = parseFloat(angles[0]);
  const b = parseFloat(angles[1]);
  const c = parseFloat(angles[2]);
  const d = parseFloat(angles[3]);
  const m = Math.max(b - a, c - b, d - c, 360 - d + a);
  const cosHalfM = Math.cos((m / 2) * Math.PI / 180);
  
  if ((c - a >= 178 && c - a <= 182) && (d - b >= 178 && d - b <= 182)) {
    pssCheckText.textContent = 'Positive Basis !!!';
  } else if (a <= b && b < a + 180 && b <= c && c < b + 180 && c <= d && d < c + 180 && d - a > 180) {
    pssCheckText.textContent = 'PSS';
  } else {
    pssCheckText.textContent = 'Not a PSS';
  }
  document.getElementById('cosHalfMValue').textContent = cosHalfM.toFixed(4);
}

function addDraggableListener(radius) {
  radius.addEventListener('mousedown', function(event) {
    event.preventDefault();
    const circleCenter = { x: 200, y: 200 };
    const initialPos = getSVGCoordinates(event);
    const initialAngle = Math.atan2(initialPos.y - circleCenter.y, initialPos.x - circleCenter.x);

    function onMouseMove(event) {
      event.preventDefault();
      const currentPos = getSVGCoordinates(event);
      const currentAngle = Math.atan2(currentPos.y - circleCenter.y, currentPos.x - circleCenter.x);
      const radiusX = circleCenter.x + 100 * Math.cos(currentAngle);
      const radiusY = circleCenter.y + 100 * Math.sin(currentAngle);

      updateRadius(radius, radiusX, radiusY);
    }

    function onMouseUp(event) {
      event.preventDefault();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // Add event listeners for mouseover and mouseout to change cursor appearance
  radius.addEventListener('mouseover', function(event) {
    radius.style.cursor = 'pointer';
  });

  radius.addEventListener('mouseout', function(event) {
    radius.style.cursor = 'default';
  });
}

// Call addDraggableListener for each draggable vector
addDraggableListener(radius1);
addDraggableListener(radius2);
addDraggableListener(radius3);
addDraggableListener(radius4);


calculateAnglesAndCheckPSS();

let selectedLine = null;

function startDragging(evt) {
  selectedLine = evt.target;
}

function dragLine(evt) {
  if (selectedLine) {
    const pt = selectedLine.ownerSVGElement.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const svgP = pt.matrixTransform(selectedLine.getScreenCTM().inverse());
    selectedLine.setAttribute('x2', svgP.x);
    selectedLine.setAttribute('y2', svgP.y);
  }
}

function stopDragging() {
  selectedLine = null;
}

// Attach event listeners
document.getElementById('svgContainer').addEventListener('mousedown', startDragging);
document.addEventListener('mousemove', dragLine);
document.addEventListener('mouseup', stopDragging);