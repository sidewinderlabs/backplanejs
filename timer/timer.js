function timer_setTimer(sName, nSecs, sType, sTarget, sEvent)
{
	if (sName[0])
		sName = sName[0].text;
	if (nSecs[0])
		nSecs = nSecs[0].text;
	if (sType[0])
		sType = sType[0].text;

	var sFn = "timer_Dispatch('" + sTarget + "', '" + sEvent + "')"; 

	switch (sType)
	{
		case "repeat":
			setInterval(sFn, nSecs);
			break;
		
		case "elapse":
		default:
			setTimeout(sFn, nSecs);
			break;
	}
	return true;
}//timer_setTimer()

function timer_Dispatch(sTarget, sEvent)
{
	var oEvt = document.createEvent("Event");
	var oTarget = document.getElementById(sTarget);
	
	oEvt.initEvent(sEvent, false, false);
	oTarget.dispatchEvent(oEvt);
	return;
}//timer_Dispatch()
