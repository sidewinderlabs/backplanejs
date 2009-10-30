window.netscape = window.netscape || {
	security: {
		PrivilegeManager: {
			enablePrivilege: function(val) {
				return;
			}
		}
	}
};
