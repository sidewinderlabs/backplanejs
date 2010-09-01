if (!document.displaySystray)
{
	document.displaySystray =
	{
		_base: "",
		_initialised: false,
		_systray: null,
		_message: "",
		_duration: 5000,
		_width: 300,
		_height: 73,

		init: function(base)
		{
			if (!this._initialised)
			{
				this._base = base;

				if (this._setImpl())
				{
 					this._systray.show("Yowl", this._base + "yowl.ico");
					this._initialised = true;
				}//if ( we successfully created a system tray handler )
			}//if ( we're not yet initialised )

			return this._initialised;
		},//init()

		createPanel: function()
		{
			return this;
		},//createPanel()

		setMessage: function(notification)
		{
			if (this._initialised)
			{
        var style = "-moz-border-radius: " + notification.radius + "px; "
          + "filter: alpha(opacity=" + notification.opacity + "); opacity: " + (notification.opacity / 100) + "; "
          + notification.style;

				this._duration = notification.duration * 1000;
        this._message =
            "<!DOCTYPE XHTML><html>"
                + "<head>"
                    + "<title>Yowl Message</title>"
                    + "<base href='" + this._base + "' />"
            + "<style type='text/css'>@import url(../yowl.css); html, body { margin: 0; padding: 0; }</style>"
                + "</head>"
                + "<body style='" + style + " overflow-y: hidden; margin: 0; padding: 0;' scroll='no'>"
                    + "<div class='notification " + notification.displayName + " " + notification.priority + "' style='color: " + notification.text + "'>"
                      + "<div class='background' style='" + style + "'></div>"
                        + "<div class='icon'>"
                            + ((notification.iconData) ? "<img src='" + notification.iconData + "' />" : "")
                        + "</div>"
                        + "<div class='title'>" + notification.title + "</div>"
                        + "<div class='text'>" + notification.description + "</div>"
                    + "</div>"
                + "</body>"
            + "</html>";
			}//if ( everything has been initialised )
			return;
		},//setMessage()

		registerForClick: function(handler)
		{
		    return;
		},//registerForClick()

		show: function()
		{
			if (this._initialised)
  			this._systray.notify(this._message, this._width, this._height, this._duration);
		},//show()

		destroy: function()
		{
		    return;
		},//destroy()

		_setImpl: function()
		{
			var bRet = false;

			if (!this._systray)
			{
				try
				{
				  /*
				   * Since the MS COM interfaces are slightly different to the XPCOM ones, we create a
				   * simple wrapper object.
				   */

					this._systray = {
					  _impl: new ActiveXObject("SoftSysTray.SysTrayIcon"),
    			  show: function(appName, icon)
    			    {
    			      this._impl.ShowIcon(appName, icon);
    			      return;
    			    },
						notify: function(message, width, height, duration)
						  {
						    this._impl.Notify(message, width, height, duration);
						    return;
						  }
    			};//systray wrapper object
					bRet = true;
				}//try to create Systray as an ActiveX component
				catch(e)
				{
					try
					{
						netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
						this._systray = Components.classes["@formsplayer.com/systray/icon;1"].createInstance(Components.interfaces["ISystemTrayIcon"]);
						bRet = true;
					}//try to create Systray as a Firefox extension
					catch(e)
					{
					  alert(e.message || e.description || e);
					}//failed to create Firefox extension
				}//Failed to create an ActiveX object
			}
			return bRet;
		}//_setImpl
	}//document.displaySystray
	
	/*
	 * This should be some kind of registration method.
	 */

  if (document.displaySystray.init(getBaseUrl()))
  {
    document.Growl._displayList["plain"].implExternal = document.displaySystray;
    document.Growl._displayList["smoke"].implExternal = document.displaySystray;
  }
}//if ( there is no systray object on document )
