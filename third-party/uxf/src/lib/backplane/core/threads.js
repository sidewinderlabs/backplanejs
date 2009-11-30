/*
 * Copyright (c) 2008-9 Backplane Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
/*global setTimeout*/

function spawn(pFunc,pOnEnd)
{
	if(pOnEnd){
		setTimeout(function(){pFunc();spawn(pOnEnd);}, 1);
	}
	else{
		setTimeout(pFunc, 1);
	}
}

function SpawnLooper(pFuncs,pOnEnd)
{
	var m_pFuncs = pFuncs?pFuncs:[];
	var m_pOnEnd = pOnEnd;
	var m_activeSpawns = 0;
	
	this.addSpawn = function(pFunc)
	{
		m_pFuncs.push(pFunc);
	};
	
	this.decrementActiveSpawns = function()
	{
		if(--m_activeSpawns === 0){
			if(m_pOnEnd){
				spawn(m_pOnEnd);
			}
		}
	};
	
	this.go = function()
	{
		var len = m_pFuncs.length;
		var callback = this.decrementActiveSpawns;
		m_activeSpawns = m_pFuncs.length;
		for(var i = 0;i< len;++i)
		{
			spawn(m_pFuncs[i],callback);
		}
	};
}
