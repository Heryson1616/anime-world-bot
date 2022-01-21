{ pkgs }: {
	deps = with pkgs; [
		nodejs-14_x
		nodePackages.typescript-language-server
	];
}