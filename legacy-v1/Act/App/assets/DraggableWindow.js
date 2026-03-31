export class DraggableWindow {
    static makeWindowDraggable(element) {
        let offsetX = 0,
            offsetY = 0,
            initialX,
            initialY;

            element.querySelector("#slide").addEventListener('mousedown', function (e) {
            e.preventDefault();
            initialX = e.clientX;  
            initialY = e.clientY;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(e) {
            e.preventDefault();
            offsetX = initialX - e.clientX;
            offsetY = initialY - e.clientY;
            initialX = e.clientX;
            initialY = e.clientY;

            element.style.top = element.offsetTop - offsetY + 'px';
            element.style.left = element.offsetLeft - offsetX + 'px';
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }
}
