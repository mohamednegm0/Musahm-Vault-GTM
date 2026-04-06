{ config, lib, pkgs, ... }:

{
  imports = [
    ./hardware-configuration.nix
  ];

  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;
  boot.supportedFilesystems = [ "ntfs" ];

  networking.hostName = "nix-laptop";
  networking.networkmanager.enable = true;

  time.timeZone = "Africa/Cairo";

  i18n.defaultLocale = "en_US.UTF-8";

  console.keyMap = "us";
  services.xserver.xkb.layout = "us";

  services.xserver.enable = true;
  services.displayManager.sddm.enable = true;
  services.desktopManager.plasma6.enable = true;

  security.rtkit.enable = true;
  services.pipewire = {
    enable = true;
    alsa.enable = true;
    alsa.support32Bit = true;
    pulse.enable = true;
  };

  nixpkgs.config.allowUnfree = true;
  hardware.enableRedistributableFirmware = true;

  users.users.ahmed = {
    isNormalUser = true;
    description = "Ahmed";
    uid = 1000;
    extraGroups = [ "wheel" "networkmanager" ];
  };

  programs.firefox.enable = true;

  environment.systemPackages = with pkgs; [
    btrfs-progs
    curl
    git
    wget
  ];

  fileSystems."/mnt/hdd" = {
    device = "/dev/disk/by-uuid/01DB5919A6A7C970";
    fsType = "ntfs3";
    options = [ "nofail" "x-systemd.automount" "uid=1000" "gid=100" "rw" "umask=022" ];
  };

  systemd.tmpfiles.rules = [
    "d /mnt/hdd 0755 ahmed users -"
  ];

  system.stateVersion = "25.11";
}
