if (!document.displaySpeech)
{
    document.displaySpeech = {
        _agentLoader: null,
        _agentLoaderRequest: null,

        _initialised: false,
        _agent: null, //equivalent to _notificationContainer
        _notifyCount: 0,
        _supported: true,

        _panel: function(id)
          {
              var oRet = new Object();

              oRet._message = "";
      
              oRet.setMessage = function(notification)
                  {
                      this._message = notification.title + ". " + notification.description;
                      return;
                  };//setMessage()
      
              oRet.registerForClick = function(f)
                  {
                      return;
                  };//registerForClick
      
              oRet.show = function()
                  {
                      var agent = document.displaySpeech._agent;

                      agent.Show();
                      agent.Play("Greet");
                      agent.Speak(this._message);
                      return;
                  };//show()
      
              oRet.destroy = function()
                  {
                      var agent = document.displaySpeech._agent;
      
                      agent.Hide();
                      return;
                  };//destroy()
              return oRet;
          },//_panel()

        init: function()
            {
                if (this._supported && !this._initialised)
                {
                    if (!this._agentLoaderRequest)
                    {
                        try
                        {
                            /*
                             * Create an MS Agent object. If it fails then set the _supported
                             * flag to false.
                             */

                        	this._agentLoader = new ActiveXObject("Agent.Control.2");
    
                            this._agentLoader.Connected = true;	//  necessary for IE3
        
                            /*
                             * Next try to load the requested character. If we already have it we
                             * can avoid an unnecessary network request.
                             */

                            try
                            {
                                this._agent = this._agentLoader.Characters.Character("genie");
                            }
                            catch(e)
                            {
                                this._agentLoaderRequest = this._agentLoader.Characters.Load(
                                    "genie"
//                                    "http://agent.microsoft.com//characters//v2//genie//genie.acf"
//                                    "Merlin",
//                                    "http://www.microsoft.com//msagent//chars//merlin//merlin.acf"
                                );
                                this._agent = this._agentLoader.Characters.Character("genie");
                            }
                            var pThis = this;
                            setTimeout(function() { pThis._checkAgentLoaded(pThis); }, 0);
                        }
                        catch(e)
                        {
                            this._supported = false;
                        }
                    }//if ( we haven't yet started to load the agent )
                }//if ( we're not already initialised )
                return this._initialised;
            },//init()

        createPanel: function()
            {
                return this._panel(this._notifyCount++);
            },//createPanel

        _configure: function(pThis)
            {
                //pThis._agent.LanguageID = 0x0409;		//  needed under come conditions
                //pThis._agent.TTSModeID = "{227A0E41-A92A-11d1-B17B-0020AFED142E}";
                pThis._agent.Get("state", "Showing, Speaking");
                pThis._agent.Get("animation", "Greet, GreetReturn");
                pThis._agent.Get("state", "Hiding");
            },//_configure()

        _checkAgentLoaded: function(pThis)
            {
                var bTryAgain = true;

                if (pThis._agentLoaderRequest && !pThis._initialised)
                {
                	switch (pThis._agentLoaderRequest.Status)
                	{
                		// 0: Request successfully completed.
                		case 0:
                      bTryAgain = false;
                	    pThis._configure(pThis);
                      pThis._initialised = true;
                      break;

                    // 2: Request pending / in queue.
                		// 4: Request in progress.
                		case 2:
                		case 4:
                			break;
    
                    // 1: Request failed.
                		// 3: Request interrupted.
                		case 1:
                		case 3:
                		default:
                			pThis._initialised = false;
                      bTryAgain = false;
                      break;
                	}//switch ( on the status of the loading )
                }//if ( a request is 'in progress' and we're not yet initialised )

                if (bTryAgain)
                    setTimeout(function() { pThis._checkAgentLoaded(pThis); }, 500);
            	return;
            }//_checkAgentLoaded()
    }//speech object
	
	/*
	 * This should be some kind of registration method.
	 */

    document.Growl._displayList["speech"] = {
        impl: null
    };
    if (document.displaySpeech.init(getBaseUrl()))
    {
      alert("speech");
      document.Growl._displayList["speech"].impl = document.displaySpeech;
    }
    else
    {
      //document.Growl._displayList["speech"].impl = document.displayYui;
      document.Growl._displayList["speech"].impl = document.displaySpeech;
    }

}//if ( the speech module is not initialised )
