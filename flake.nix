{
  description = "Go CLI with Cobra/Viper, Goreleaser, Nix flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    nix-lib.url = "github:nix-community/nix-lib";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      nix-lib,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };

        # Read binary name from .goreleaser.yaml
        project = (nix-lib.lib.formats.fromYAML (builtins.readFile ./.goreleaser.yaml))[0];
        binaryName = project.project_name;

        # Allow injecting a tagged version via env for CI releases:
        #   VERSION=$(./scripts/version.sh) nix build --impure .#mycli
        verFromEnv = builtins.getEnv "VERSION";
        version = if verFromEnv != "" then verFromEnv else "dev";
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
          shellHook = ''
            chmod +x scripts/version.sh 2>/dev/null || true
            export VERSION="$($PWD/scripts/version.sh || echo dev)"
            echo "VERSION=$VERSION  (from git tag or 'dev')"
          '';
        };

        formatter = pkgs.nixpkgs-fmt;
      }
    );
}
