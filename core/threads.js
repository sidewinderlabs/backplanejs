function spawn(pFunc,pOnEnd)
{
	if(pOnEnd)
		setTimeout(function(){pFunc();spawn(pOnEnd);}, 1);
	else
		setTimeout(pFunc, 1);
}

function SpawnLooper(pFuncs,pOnEnd)
{
	var m_pFuncs = pFuncs?pFuncs:new Array();
	var m_pOnEnd = pOnEnd;
	var m_activeSpawns = 0;
	
	this.addSpawn = function(pFunc)
	{
		m_pFuncs.push(pFunc);
	}
	
	this.decrementActiveSpawns = function()
	{
		if(--m_activeSpawns == 0)
		{
			if(m_pOnEnd)
				spawn(m_pOnEnd);
		}
	}
	
	this.go = function()
	{
		var len = m_pFuncs.length;
		var callback = this.decrementActiveSpawns;
		m_activeSpawns = m_pFuncs.length;
		for(var i = 0;i< len;++i)
		{
			spawn(m_pFuncs[i],callback);
		}
	}
}
