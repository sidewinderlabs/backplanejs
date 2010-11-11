
var Alert = new UX.Class({

	Mixins: [MIPHandler, Context, SrcMixin, Control, OptionalBinding, LoadExternalMixin],
	
	toString: function() {
		return 'xf:alert';
	}
	
});
