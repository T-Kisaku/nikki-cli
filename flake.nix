{
  description = "Go CLI with Cobra/Viper, Goreleaser, Nix flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        releaseInfo = builtins.fromJSON (builtins.readFile ./release.json);
        binaryName = releaseInfo.binaryName;
        version = releaseInfo.version;

      in
      {
        packages.default = pkgs.buildGoModule {
          pname = binaryName;
          inherit version;
          src = ./.;

          modVendor = true;
          vendorHash = null;

          env = {
            CGO_ENABLED = "0";
          };
          ldflags = [
            "-s"
            "-w"
            "-X github.com/T-Kisaku/nikki-cli/internal/buildinfo.Version=${version}"
            "-X github.com/T-Kisaku/nikki-cli/internal/buildinfo.Name=${binaryName}"
          ];
        };

        apps.default = {
          type = "app";
          program = "${self.packages.${system}.default}/bin/${binaryName}";
        };

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            go
            gopls
            delve
            golangci-lint
            goreleaser
            cobra-cli
          ];
        };

        formatter = pkgs.nixpkgs-fmt;
      }
    );
}
