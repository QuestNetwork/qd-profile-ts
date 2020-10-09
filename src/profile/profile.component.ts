import { QuestOSService } from '../../../qDesk/src/app/services/quest-os.service';

import {
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  ViewChild,
  TemplateRef
} from '@angular/core';
import {BehaviorSubject, Observable, of as observableOf} from 'rxjs';

import { BarcodeFormat } from '@zxing/library';
import {NbDialogService } from '@nebular/theme';


import { DomSanitizer } from '@angular/platform-browser';

import { NbComponentStatus } from '@nebular/theme';
// import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
//
// import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import swarmJson from '../swarm.json';


@Component({
  selector: 'app-social-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  @Input() pubKey: string;

  newPost = "";
  timeline = [];

  async post(){
    if(typeof this.pubKey == undefined || this.pubKey == 'NoProfileSelected'){
      throw('post failed: this.pubKey');
    }

    let postObj = { content: this.newPost, socialPubKey: this.pubKey };
    await this.q.os.social.timeline.post.new(postObj);


    this.newPost = "";
    setTimeout( () => {
      this.init();
    },2000);
  }

  addEmoji($event){
    // let data = this.emojiForm.get('inputField');
    // data.patchValue(data.value + $event.emoji.native)

    this.newPost +=  ' ' + $event.emoji.colons + ' ';
  }



  constructor(private _sanitizer: DomSanitizer, private dialog:NbDialogService, private cd: ChangeDetectorRef, private q: QuestOSService) {
    //parse channels
  }
  DEVMODE = swarmJson['dev'];

  @Input() buttonTitle: string = '';
  status: NbComponentStatus | '' = '';
  inputFocus: boolean = false;
  inputHover: boolean = false;

  parseSearchBar(){
    if(this.searchPhrase.length > 0){
      this.search();
    }
    else{
      this.searchResultsActive = false;
      this.cd.detectChanges();
    }
  }




  searchPhrase ="";
  searchResults = [];
  async search(){
    this.searchResults = await this.q.os.social.profile.search(this.searchPhrase);
    if(this.searchResults.length > 0){
      this.searchResultsActive = true;
    }
    else{
      this.searchResultsActive = false;
    }
    this.cd.detectChanges();
  }


  searchResultsActive = false;


    setStatus(status: NbComponentStatus): void {
      if (this.status !== status) {
        this.status = status;
        // this.cd.detectChanges();
      }
    }

    getInputStatus(): NbComponentStatus | '' {
      // if (this.fileOver) {
      //   return this.status || 'primary';
      // }
      //
      // if (this.inputFocus || this.inputHover) {
      //   return this.status;
      // }

      return '';
    }

  noProfileSelected = "NoProfileSelected";
  async init(){
    console.log("Profile: Initializing...");
    this.isConnection = this.q.os.social.profile.isFavorite(this.pubKey);
    this.isRequestedConnection = this.q.os.social.profile.isRequestedFavorite(this.pubKey);
    this.isVerified = this.q.os.social.profile.isVerified(this.pubKey);
    //load channel
    console.log("Profile: Bootstrapping Profile...");

    this.select(this.pubKey);
    try{
      this.timeline = await this.q.os.social.timeline.get(this.pubKey);
    }catch(e){
      if(e == 'no pubkey selected'){
        let p = await this.q.os.social.profile.getMyProfile();
        this.pubKey = p['key']['pubKey'];
        this.timeline = await this.q.os.social.timeline.get(this.pubKey);
      }
    }

    console.log('qD Social: Getting Timeline...',  this.timeline );
    this.cd.detectChanges();
  }

   ngOnInit(){
     this.q.os.social.profile.onSelect().subscribe( (pK) => {
       this.pubKey = pK;

       this.timeline = [];
       setTimeout( async () => {
         this.timeline = await this.q.os.social.timeline.get(this.pubKey);
         this.cd.detectChanges();
       },2000);

       this.init();


     });
     this.init();

  }


  alias = "Anonymous";
  fullName = "Anonymous";
  about = "The Universe is under no obligation to make sense to you. I'd rather not say anything. do@not-find-me.com";

  editDetails = false;
  newAlias;
  newFullName;
  newAbout;
  edit(value = true){

    if(value){
      this.newAlias = this.alias;
      this.newFullName = this.fullName;
      this.newAbout = this.about;
    }

    this.editDetails = value;
  }

  save(){
    let socialComb = { private: this.private, alias: this.newAlias, fullName: this.newFullName, about: this.newAbout};
    this.q.os.social.profile.set(this.pubKey,socialComb);
    this.q.os.social.profile.select(this.pubKey);
    this.edit(false);
  }

  isMyProfile = false;
  async select(profileId){
    console.log("Selecting profile...",profileId)
    // console.log(this.q.os.social.getProfile(profileId));

    try{
     let socialComb = await this.q.os.social.profile.get(profileId);
     if(socialComb['key']['pubKey'] != profileId){
       this.pubKey = socialComb['key']['pubKey'];
     }

     console.log(this.pubKey);

     this.isMyProfile = this.q.os.social.profile.isMyProfileId(this.pubKey);
     console.log('Social: Is my profile:',this.isMyProfile);

     if(typeof socialComb['alias'] != 'undefined'){
       this.alias = socialComb['alias'];
     }
     if(typeof socialComb['fullName'] != 'undefined'){
       this.fullName = socialComb['fullName'];
     }
     if(typeof socialComb['about'] != 'undefined'){
       this.about = socialComb['about'];
     }
     if(typeof socialComb['private'] != 'undefined'){
       this.private = socialComb['private'];
     }

     this.cd.detectChanges();

    }catch(e){console.log(e)}
  }

  private = true;
  isConnection = false;
  isRequestedConnection = false;
  requestLock = false;
  async setConnection(v){
    if(this.requestLock){
      return false;
    }
    this.requestLock = true;
    // this.isConnection = v;
    if(v){
      let mpk = await this.q.os.social.profile.getMyProfileId();
      console.log('qSocial: trying to add New Favorite Request...',this.pubKey);
      if(!this.q.os.social.profile.isRequestedFavorite(this.pubKey)){
        let chName = await this.q.os.channel.create('qprivatedch-'+mpk+'-'+this.pubKey,"",true);
        this.q.os.social.profile.addFavoriteRequest(this.pubKey,chName);
        this.isRequestedConnection = v;
        this.requestLock = false;
      }
    }
    else{
      //remove also the channelList
      // this.q.os.channel.remove(this.q.os.social.getRequestedFavoriteChannel(this.pubKey));
      let channel = this.q.os.channel.find(this.pubKey);
      this.q.os.channel.remove(channel);
      this.q.os.social.profile.removeFavorite(this.pubKey);
      this.q.os.social.profile.removeFavoriteRequest(this.pubKey);
      this.isRequestedConnection = v;
      this.isConnection = v;
      this.requestLock = false;
    }
  }
  async  togglePrivacy(){
    if(!this.isMyProfile){
      return false;
    }

    await this.q.os.social.profile.togglePrivacy(this.pubKey);

    if(this.private){
      this.private = false;
    }
    else{
      this.private = true;
    }
  }



    async openProfile(pubKey){
      this.pubKey = pubKey;
      this.q.os.social.profile.select(this.pubKey);
      this.searchResultsActive = false;

    }


  async openMessages(pubKey){
    let channelName = this.q.os.channel.find(pubKey);
    this.q.os.channel.select(channelName);
    this.q.os.ui.toTabIndex('1');
  }


  searchBarClicked(){
    if(this.searchResults.length > 0){
      this.searchResultsActive = true;
    }
  }





    @ViewChild('qrPop') qrPop;
    @ViewChild('createPop') createPop;

    availableDevices: MediaDeviceInfo[];
    currentDevice: MediaDeviceInfo = null;

    formatsEnabled: BarcodeFormat[] = [
      BarcodeFormat.QR_CODE,
    ];

    hasDevices: boolean;
    hasPermission: boolean;

    torchEnabled = false;
    torchAvailable$ = new BehaviorSubject<boolean>(false);
    tryHarder = false;

    verify(){
      this.scanQR();
    }

    isVerified = false;

    onCamerasFound(devices: MediaDeviceInfo[]): void {
      this.availableDevices = devices;
      this.hasDevices = Boolean(devices && devices.length);
    }

    onDeviceSelectChange(selected: string) {
      const device = this.availableDevices.find(x => x.deviceId === selected);
      this.currentDevice = device || null;
    }

    onHasPermission(has: boolean) {
      this.hasPermission = has;
    }

    onTorchCompatible(isCompatible: boolean): void {
      this.torchAvailable$.next(isCompatible || false);
    }

    toggleTorch(): void {
      this.torchEnabled = !this.torchEnabled;
    }

    toggleTryHarder(): void {
      this.tryHarder = !this.tryHarder;
    }
    verifyQrCode = "";
    async qrSuccessHandler(event){
      console.log(event);
      alert('success!');
      if(await this.q.os.social.verify(this.pubKey, JSON.parse(event))){
        this.isVerified = true;
      }
      else{
          this.q.os.ui.showSnack('Verification Failed',{duration:2000});
          this.isVerified = false;
      }
      this.closePopup();
    }

    closeQR(){
      setTimeout( () => {
        this.closePopup();
      },500);
    }
    scanQR(){
      const data = {
        hasDevices: this.hasDevices,
        hasPermission: this.hasPermission,
      };
      this.open(this.qrPop);

    }


    @ViewChild('qrCode') qrCode;
    async showVerificationQR(){
      if(this.isMyProfile){

        let text = await this.q.os.social.profile.getVerificationQR();
        console.log(text);
        this.generateQR(text);
        this.open(this.qrCode);
        this.q.os.social.profile.startVerificationWorker();
      }
    }



    popupRef = [];
    open(dialog: TemplateRef<any>) {
          this.popupRef.push(this.dialog.open(dialog, { context: 'this is some additional data passed to dialog' }));
      }
    closePopup(){
      console.log('close toggled');
      // for(i=0;i<this.popupRef.length;i++){
        this.popupRef[this.popupRef.length-1].close();
        this.popupRef.pop();
      // }
    }












    qrCodeURLSafe;

    async generateQR(text){
      console.log(text);
      this.qrCodeURLSafe = this._sanitizer.bypassSecurityTrustUrl(await this.q.os.utilities.qr.generate(text));
    }

    isOwner = false;
    generateInviteCode(){
      // let channel = this.selectedChannel;
      // let link;

        // link =  this.q.os.channel.invite.create(channel,this.newInviteCodeMax);

      // let ivC =  this.q.os.ocean.dolphin.getInviteCodes(this.selectedChannel);
      // this.channelInviteCodes = [];
      // if(typeof ivC != 'undefined' && typeof ivC['items'] != 'undefined'){
      //          this.channelInviteCodes = ivC['items'];
      // }
    }












}
