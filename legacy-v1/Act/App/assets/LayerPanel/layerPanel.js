export function initLayerPanel() {
    const buttonLeft = document.getElementById('heatMapLayerB');
    const panelLeft = document.getElementById('heatMapLayer-container');
    let clickedLeft = false;

    const buttonMiddle = document.getElementById('routeLayerB');
    const panelMiddle = document.getElementById('routeLayer-container');
    let clickedMiddle = false;

    const buttonRight = document.getElementById('graphLayerB');
    const panelRight = document.getElementById('graphLayer-container');
    let clickedRight = false;

    //click
    buttonLeft.addEventListener('click', () => {
        clickedLeft = !clickedLeft;
        buttonLeft.style.color = '#023E7D';
        buttonLeft.style.background = '#023E7D59';
        panelLeft.style.display = 'flex';

        clickedMiddle = false;
        buttonMiddle.style.color = '#ffffff80';
        buttonMiddle.dispatchEvent(new Event('mouseleave'));
        panelMiddle.style.display = 'none';

        clickedRight = false;
        buttonRight.style.color = '#ffffff80';
        buttonRight.dispatchEvent(new Event('mouseleave'));
        panelRight.style.display = 'none';
    });

    buttonMiddle.addEventListener('click', () => {
        clickedLeft = false;
        buttonLeft.style.color = '#ffffff80';
        buttonLeft.dispatchEvent(new Event('mouseleave'));
        panelLeft.style.display = 'none';

        clickedMiddle = !clickedMiddle;
        buttonMiddle.style.color = '#33415C';
        buttonMiddle.style.background = '#33415C59';
        panelMiddle.style.display = 'flex';

        clickedRight = false;
        buttonRight.style.color = '#ffffff80';
        buttonRight.dispatchEvent(new Event('mouseleave'));
        panelRight.style.display = 'none';
    });

    buttonRight.addEventListener('click', () => {
        clickedLeft = false;
        buttonLeft.style.color = '#ffffff80';
        buttonLeft.dispatchEvent(new Event('mouseleave'));
        panelLeft.style.display = 'none';

        clickedMiddle = false;
        buttonMiddle.style.color = '#ffffff80';
        buttonMiddle.dispatchEvent(new Event('mouseleave'));
        panelMiddle.style.display = 'none';

        clickedRight = !clickedRight;
        buttonRight.style.color = '#76787E';
        buttonRight.style.background = '#979DAC59';
        panelRight.style.display = 'flex';
    });

    //hover
    buttonLeft.addEventListener('mouseenter', () => {
        if (!clickedLeft) {
            buttonLeft.style.background = '#023E7D26';
        }
    });
    buttonLeft.addEventListener('mouseleave', () => {
        if (!clickedLeft) {
            buttonLeft.style.background = 'transparent';
        }
    });

    buttonMiddle.addEventListener('mouseenter', () => {
        if (!clickedMiddle) {
            buttonMiddle.style.background = '#33415C26';
        }
    });
    buttonMiddle.addEventListener('mouseleave', () => {
        if (!clickedMiddle) {
            buttonMiddle.style.background = 'transparent';
        }
    });

    buttonRight.addEventListener('mouseenter', () => {
        if (!clickedRight) {
            buttonRight.style.background = '#979DAC26';
        }
    });
    buttonRight.addEventListener('mouseleave', () => {
        if (!clickedRight) {
            buttonRight.style.background = 'transparent';
        }
    });
}
