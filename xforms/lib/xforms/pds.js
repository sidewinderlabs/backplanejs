/*
 * Copyright (C) 2008 Backplane Ltd.
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

function Vertex(oVT)
{
	this.vertexTarget = oVT;
	this.depList = [];
	this.inDegree = 0;
	this.visited = false;
	this.index = 0;
}

Vertex.prototype.setDependencyList = function(ar)
{
	this.depList = ar;
};

Vertex.prototype.addDependent = function(oVertex)
{
	this.depList.push(oVertex);
};

function Pair(first, second)
{
	this.first = first;
	this.second = second;
}

function ChangeList()
{
	this.m_Lc = [];
}

ChangeList.prototype.addChange = function(oVertex)
{
	this.m_Lc.push(oVertex);
};

ChangeList.prototype.clear = function()
{
	this.m_Lc.length = 0;
};

function dependencyEngine()
{
	// M represents the master dependency directed graph.
	this.m_M = [];
}

dependencyEngine.prototype.clear = function()
{
	var M = this.m_M;

	/*
	 * Before we clear the list we need to go to
	 * each of the vertices in the list and find
	 * its vertex target, which will in turn give
	 * us the proxy node...where we need to remove
	 * the reference to the vertex.
	 */

	for (var i = 0; i < M.length; i++)
	{
		var v = M[i];
		var oVT = v.vertexTarget;

		if (oVT && oVT.m_oProxy) {
			oVT.m_oProxy.m_vertex = null;
		}
	}

	/*
	 * Now clear the list.
	 */

	M.length = 0;
};

dependencyEngine.prototype.createVertex = function(oVT)
{
	var v = new Vertex(oVT);

	this.m_M.push(v);
	return v;
};

dependencyEngine.prototype.recalculate = function(oChangeList)
{
	this.ProcessPertinentDependencySubgraph(
		this.CreatePertinentDependencySubgraph(oChangeList.m_Lc)
	);
};

dependencyEngine.prototype.CreatePertinentDependencySubgraph = function(Lc)
{
	var M = this.m_M;
	var S =  [];
	var stack =  [];
	for(var i = 0; i < Lc.length; ++i) {
		var r = Lc[i];
		if(r.visited === false) {
			stack.push(new Pair(null, r));
			while(stack.length > 0) {
				var p = stack.pop();
				var v = p.first;
				var w = p.second;

				var wS = null;
				if(w.visited === false) {
					w.visited = true;
					w.index = S.length;
					wS = new Vertex(w.vertexTarget);
					for(var j = 0; j < M.length; ++j) {
						var x = M[j];
						if(x == w) {
							wS.index = j;
							break;
						}
					}
					S.push(wS);
					if(typeof w.depList  == "object" && w.depList !== null) {
						for(var j = 0; j < w.depList.length; ++j) {
							var x = w.depList[j];
							stack.push(new Pair(w, x));
						}
					}
				}
				else
					wS = S[w.index];

				if(v !==null && wS) {
					var vS = S[v.index];
					if(typeof(vS.depList) != "object" || vS.depList == null)
						vS.depList = new Array;
					vS.depList.push(wS);
					++wS.inDegree;
				}
				

			}
		}
	}

	for(var i = 0; i < S.length; ++i) {
		var vS = S[i];
		var v = M[vS.index];
		v.visited = false;
	}

	return S;
};
//TODO: rewrite to be flatter, this can go massively recursive.
dependencyEngine.prototype.ProcessPertinentDependencySubgraph = function(S)
{
/*
	while(S.length > 0)
	{
		var vS = S.shift();
		if (vS.inDegree == 0) {
			this.doUpdate(vS);

			if(typeof(vS.depList) == "object" && vS.depList != null) {
				for(var j = 0; j < vS.depList.length; ++j) {
					var wS = vS.depList[j];
					--wS.inDegree;
				}
			}
		}
		else
		{
			S.push(vS);
		}
		
	}*/

	for(var i = 0; i < S.length; i++) {
		var vS = S[i];
		if (vS.inDegree == 0) {
			S.splice(i, 1);

			this.doUpdate(vS);

			if(typeof(vS.depList) == "object" && vS.depList != null) {
				for(var j = 0; j < vS.depList.length; ++j) {
					var wS = vS.depList[j];
					--wS.inDegree;
				}
			}

			this.ProcessPertinentDependencySubgraph(S);

			break;
		}
	}

	if(S.length > 0)
		throw "xforms-compute-exception: Recursive calculation structure detected.";
};

dependencyEngine.prototype.doUpdate = function(vS)
{
	if(typeof(vS) == "object" && vS != null && typeof(vS.vertexTarget) == "object" && vS.vertexTarget != null)
	{
		vS.vertexTarget.update();
	}
	else
		throw "doUpdate(): Invalid argument.";
};

var bEnableDumpState = false;
if(bEnableDumpState)
{
	Vertex.prototype.dumpState = function(sIndent)
	{
		var s ="[vertex] target=" + this.vertexTarget.identifier();
		var sChildIndent = sIndent + "\t";
		for(var i = 0;i < this.depList.length;++i)
		{
			s += ("\n" + sIndent + this.depList[i].dumpState(sChildIndent));
		}
		return s;
	}

	dependencyEngine.prototype.dumpState = function()
	{
		var s = "Dependency Engine";
		for(var i = 0;i < this.m_M.length;++i)
		{
			s += ("\n" + this.m_M[i].dumpState("\t"));
		}
		return s;
	}
}
