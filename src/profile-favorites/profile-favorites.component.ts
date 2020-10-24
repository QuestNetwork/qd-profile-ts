import { Component, Injectable,ElementRef,OnInit, TemplateRef, ViewChild, OnDestroy,ChangeDetectorRef, NgZone } from '@angular/core';
import { QuestOSService } from '../../../qD/src/app/services/quest-os.service';
import { NbMenuService,NbDialogService } from '@nebular/theme';
import { UiService} from '../../../qD/src/app/services/ui.service';
import { BarcodeFormat } from '@zxing/library';

import { Router, ActivatedRoute } from '@angular/router';


import { filter, map } from 'rxjs/operators';

import { v4 as uuidv4 } from 'uuid';
import swarmJson from '../swarm.json';



import {BehaviorSubject, Observable, of as observableOf} from 'rxjs';
import {CdkDragDrop} from '@angular/cdk/drag-drop';

import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import {  MatMenuTrigger } from '@angular/material/menu';

/**
 * Node for to-do item
 */
export class TodoItemNode {
  children: TodoItemNode[];
  item: string;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
}

/**
 * The Json object for to-do list data.
 */

  var TREE_DATA ={

};


/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChannelFavoritesDatabase {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] { return this.dataChange.value; }

  constructor() {
    this.initialize();
  }

  initialize() {
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    const data = this.buildFileTree(TREE_DATA, 0);

    // Notify the change.
    // this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
  buildFileTree(obj: object, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string): TodoItemNode {
    if (!parent.children) {
      parent.children = [];
    }
    const newItem = { item: name } as TodoItemNode;
    parent.children.push(newItem);
    this.dataChange.next(this.data);

    return newItem;

  }

  // insertItemAbove(node: TodoItemNode, name: string): TodoItemNode {
  //   const parentNode = this.getParentFromNodes(node);
  //   const newItem = { item: name } as TodoItemNode;
  //   if (parentNode != null) {
  //     parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
  //   } else {
  //     this.data.splice(this.data.indexOf(node), 0, newItem);
  //   }
  //   this.dataChange.next(this.data);
  //   return newItem;
  // }
  //
  // insertItemBelow(node: TodoItemNode, name: string): TodoItemNode {
  //   const parentNode = this.getParentFromNodes(node);
  //   const newItem = { item: name } as TodoItemNode;
  //   if (parentNode != null) {
  //     parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newItem);
  //   } else {
  //     this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
  //   }
  //   this.dataChange.next(this.data);
  //   return newItem;
  // }

  getParentFromNodes(node: TodoItemNode): TodoItemNode {
    for (let i = 0; i < this.data.length; ++i) {
      const currentRoot = this.data[i];
      const parent = this.getParent(currentRoot, node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }



  getParent(currentRoot: TodoItemNode, node: TodoItemNode): TodoItemNode {
    if (currentRoot.children && currentRoot.children.length > 0) {
      for (let i = 0; i < currentRoot.children.length; ++i) {
        const child = currentRoot.children[i];
        if (child === node) {
          return currentRoot;
        } else if (child.children && child.children.length > 0) {
          const parent = this.getParent(child, node);
          if (parent != null) {
            return parent;
          }
        }
      }
    }
    return null;
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }

  deleteItem(node: TodoItemNode) {
    this.deleteNode(this.data, node);
    this.dataChange.next(this.data);
  }

  copyPasteItem(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItem(to, from.item);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }
  //
  // copyPasteItemAbove(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
  //   // const newItem = this.insertItemAbove(to, from.item);
  //   // if (from.children) {
  //   //   from.children.forEach(child => {
  //   //     this.copyPasteItem(child, newItem);
  //   //   });
  //   // }
  //   // return newItem;
  // }
  //
  // copyPasteItemBelow(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
  //   // const newItem = this.insertItemBelow(to, from.item);
  //   // if (from.children) {
  //   //   from.children.forEach(child => {
  //   //     this.copyPasteItem(child, newItem);
  //   //   });
  //   // }
  //   // return newItem;
  // }

  deleteNode(nodes: TodoItemNode[], nodeToDelete: TodoItemNode) {
    const index = nodes.indexOf(nodeToDelete, 0);
    if (index > -1) {
      nodes.splice(index, 1);
    } else {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          this.deleteNode(node.children, nodeToDelete);
        }
      });
    }
  }


  //
  public filter(filterText: string) {
    let  treeData = {
      Filter: {
        emptyFolder: { }
      },
      Function: {

  emptyFolder: { }

      },
      Missing: {
  emptyFolder: { }
      }

    };

    let filteredTreeData;
    if (filterText && filterText.length>0) {



  //{}
  //     console.log(treeData);
  //     filteredTreeData = treeData.filter(d => d.text.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);
  //     Object.assign([], filteredTreeData).forEach(ftd => {
  //       let str = (<string>ftd.code);
  //       while (str.lastIndexOf('.') > -1) {
  //         const index = str.lastIndexOf('.');
  //         str = str.substring(0, index);
  //         if (filteredTreeData.findIndex(t => t.code === str) === -1) {
  //           const obj = treeData.find(d => d.code === str);
  //           if (obj) {
  //             filteredTreeData.push(obj);
  //           }
  //         }
  //       }
  //     });

  filteredTreeData = treeData;

    } else {
      filteredTreeData = TREE_DATA;
    }
  //
  //   // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
  //   // file node as children.
    const data = this.buildFileTree(filteredTreeData, 0);
  //   // Notify the change.
    this.dataChange.next(data);
  }

  q;
  setQOS(q){
    this.q = q;
  }



}

@Component({
  selector: 'social-profile-favorites',
  templateUrl: './profile-favorites.component.html',
  styleUrls: ['./profile-favorites.component.scss'],
  providers: [ChannelFavoritesDatabase]

})
export class ProfileFavoritesComponent implements OnInit {

  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
  // @ViewChild('contextMenu') contextMenu: MatMenuTrigger;

contextMenuPosition = { x: '0px', y: '0px' };
onContextMenu(event: MouseEvent, item) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY-40 + 'px';
    this.contextMenu.menuData = { 'item': item };
    // this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  onContextMenuAction1(item) {
    // alert(`Click on Action 1 for ${item}`);
  }

  onContextMenuAction2(item) {
    // alert(`Click on Action 2 for ${item}`);
  }
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  /* Drag and drop */
  dragNode: any;
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: number;
  @ViewChild('emptyItem') emptyItem: ElementRef;


  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = (node.children && node.children.length > 0);
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }




  /** Save the node to database */
  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.updateItem(nestedNode, itemValue);
  }

  handleDragStart(event, node) {
    // Required by Firefox (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    // event.dataTransfer.setData('foo', 'bar');
    //event.dataTransfer.setDragImage(this.emptyItem.nativeElement, 0, 0);
    this.dragNode = node;
    this.treeControl.collapse(node);
  }

 handleDragOver(event, node) {
    event.preventDefault();
    // Handle node expand
    if(node['item'].indexOf('-----') === -1){

          if (this.dragNodeExpandOverNode && node === this.dragNodeExpandOverNode) {
            if ((Date.now() - this.dragNodeExpandOverTime) > this.dragNodeExpandOverWaitTimeMs) {
              if (!this.treeControl.isExpanded(node)) {
                this.treeControl.expand(node);
                //this.cd.detectChanges();
              }
            }
          } else {
            this.dragNodeExpandOverNode = node;
            this.dragNodeExpandOverTime = new Date().getTime();
          }

          // Handle drag area
          const percentageY = event.offsetY / event.target.clientHeight;
          if (0 <= percentageY && percentageY <= 0.25) {
            this.dragNodeExpandOverArea = 0;
            this.dragNodeExpandOverAreaReal = 1;
          } else if (1 >= percentageY && percentageY >= 0.75) {
            this.dragNodeExpandOverArea = 0;
            this.dragNodeExpandOverAreaReal = -1;
          } else {
            this.dragNodeExpandOverAreaReal = 0;
            this.dragNodeExpandOverArea = 0;
          }
    }
  }

  dragNodeExpandOverAreaReal = 0;
  handleDrop(event, node) {

    if (node !== this.dragNode && node['item'].indexOf('-----') < 0){

      let newItem: TodoItemNode;
      if (this.dragNodeExpandOverAreaReal === 1) {
        // newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      } else if (this.dragNodeExpandOverAreaReal === -1) {
        // newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      } else {
        newItem = this.flatNodeMap.get(this.dragNode);
        this.database.deleteItem(newItem);
        newItem = this.database.copyPasteItem(newItem, this.flatNodeMap.get(node));
        this.saveExpandedNodes();
        this.buildFavoriteFolderListFromTreeNodeData();
      }
      // this.buildChannelFolderListFromTreeNodeData();


      // this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem));



    }

     this.handleDragEnd(event);



  }


  handleDragEnd(event) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
    this.dragNodeExpandOverArea = NaN;
    event.preventDefault();
  }

  getStyle(node: TodoItemFlatNode) {

    if(node.item == 'emptyFolder'){
      return 'display-none';
    }

    if (this.dragNode === node) {
      return 'drag-start';
    } else if (this.dragNodeExpandOverNode === node) {
      switch (this.dragNodeExpandOverArea) {
        case 1:
          return 'drop-above';
        case -1:
          return 'drop-below';
        default:
          return 'drop-center'
      }
    }

    // if(this.getAliasFromDirectChannel2(node.item).indexOf('qprivatedch') > -1){
    //   return 'display-none';
    // }

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

  deleteItem(node: TodoItemFlatNode) {
    this.database.deleteItem(this.flatNodeMap.get(node));
  }


  filterChanged(filterText: string) {
    this.database.filter(filterText);
    if(filterText)
    {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
    }
  }



  channelNameList = [];

  public getFavoriteFolderNameFromId(id){
    if(id == 'emptyFolder'){
      return id;
    }
    return this.q.os.bee.config.getFavoriteFolderNameFromId(id);
  }

  public isFolder(id){
    if(id.indexOf('-----') > -1){
      return false;
    }
    return true;
    // return this.q.os.bee.config.isChannelFolderItemFolder(id);
  }

  buildFavoritelFolderListFromTreeNodeData(){
    console.log('!!!!!');
    console.log(this.database.data);
    let data = this.database.data;
    data = data.filter( n => n.item != 'emptyFolder' );
    let chFL = [];
    for(let i=0;i<data.length;i++){
        console.log(data[i]);
        let kind = "dir";
        if(data[i]['item'].indexOf('-----') > -1){
          kind = "channel";
        }
        console.log(kind);
          let children = [];
        if(typeof data[i]['children'] != 'undefined' && data[i]['children']['length'] > 0){
           children = this.getFavoriteFolderListTreeChildrenRec(data[i]['children']);
        }
        chFL.push({ id: data[i]['item'], data: { name: this.q.os.bee.config.getFavoriteFolderNameFromId(data[i]['item']), kind: kind, items: 0 }, children: children } );
    }
    this.q.os.bee.config.setFavoriteFolderList(chFL);
    return true;
  }


  itemClickSub;
  dataChangeSub;
  favoriteFolderListSub;
  selectedChannelSub;
  ngOnDestroy(){
    console.log('ChannelList: ngOnDestroy...')
    clearInterval(this.updateNamesInterval);
    this.itemClickSub.unsubscribe();
    this.dataChangeSub.unsubscribe();
    this.favoriteFolderListSub.unsubscribe();
    // this.selectedChannelSub.unsubscribe();
    }

  constructor(private router:Router, private ngZone:NgZone, private cd: ChangeDetectorRef, private database: ChannelFavoritesDatabase,private ui: UiService,private dialog:NbDialogService,private nbMenuService: NbMenuService, private q: QuestOSService) {

    this.itemClickSub = this.nbMenuService.onItemClick().subscribe( (menuItem) => {

        // if(String(menuItem.item.title) == 'Add Favorite'){
        //     this.getFavoriteFolderList();
        //     this.open(this.importPop);
        // }
       if(String(menuItem.item.title) == 'New Favorite Folder'){
            this.getFavoriteFolderList();
            this.open(this.newFavoriteFolderPop);
        }
    });



    this.database.setQOS(this.q);

    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);


    }

incomingFavoriteRequestList = [];
updateNamesInterval;
       ngOnInit() {

        this.updateNamesInterval = setInterval( () => {
          this.saveExpandedNodes();
          this.loadChannels(this.favoriteFolderList);

        },10000);


        this.favoriteFolderList = this.q.os.bee.config.getFavoriteFolderList();

        this.dataChangeSub = this.database.dataChange.subscribe(data => {
          this.dataSource.data = [];
          this.dataSource.data = data;
        });

        this.favoriteFolderListSub  = this.q.os.bee.config.favoriteFolderListSub.subscribe( (chFL: []) => {
              this.loadChannels(chFL);
        });

        this.loadChannels(this.favoriteFolderList);

      }

    loadChannels(chFL){

      this.incomingFavoriteRequestList =  this.q.os.ocean.dolphin.getIncomingFavoriteRequests().filter(e => !this.q.os.utilities.inArray(this.q.os.ocean.dolphin.getChannelNameList(),e['channel']));

      TREE_DATA =  this.q.os.bee.config.getFavoriteFolderIDList();
      this.database.filter("");
      if(chFL.length > 0 && this.q.os.bee.config.getExpandedFavoriteFolderItems().length > 0 ){
        console.log('got a saved state!');
        this.expandedNodes = this.q.os.bee.config.getExpandedFavoriteFolderItems();
        this.restoreExpandedNodes();
      }

      this.updateNames();

    }



    expandedNodes;
    restoreFlag = 0;
    sENwriteBlock = 0;
    saveExpandedNodes() {
      this.sENwriteBlock = 1;
      this.expandedNodes = [];
      for(let i=0;i<this.treeControl.dataNodes.length;i++){
        let node = this.treeControl.dataNodes[i];
          if (node.expandable && this.treeControl.isExpanded(node)) {
              this.expandedNodes.push(node);
          }
      }
      console.log('ChannelList: Persisting expanded folders...');
      this.q.os.bee.config.setExpandedFavoriteFolderItems(this.expandedNodes);
      this.sENwriteBlock = 0;
      return true;

    }

    buildFavoriteFolderListFromTreeNodeData(){
      console.log('!!!!!');
      console.log(this.database.data);
      let data = this.database.data;
      data = data.filter( n => n.item != 'emptyFolder' );
      let chFL = [];
      for(let i=0;i<data.length;i++){
          console.log(data[i]);
          let kind = "dir";
          if(data[i]['item'].indexOf('-----') > -1){
            kind = "channel";
          }
          console.log(kind);
            let children = [];
          if(typeof data[i]['children'] != 'undefined' && data[i]['children']['length'] > 0){
             children = this.getFavoriteFolderListTreeChildrenRec(data[i]['children']);
          }
          chFL.push({ id: data[i]['item'], data: { name: this.q.os.bee.config.getFavoriteFolderNameFromId(data[i]['item']), kind: kind, items: 0 }, children: children } );
      }
      this.q.os.bee.config.setFavoriteFolderList(chFL);
      return true;
    }


    selectChannel(channelName){
        console.log("ChannelList: Trying to select: >>"+channelName.trim());
        if(this.q.os.utilities.inArray(this.q.os.ocean.dolphin.getChannelNameList(),channelName.trim())){
          console.log('ChannelList: Selecting: ',channelName.trim());
          this.q.os.channel.select(channelName.trim());
          if(this.q.os.ui.getSideBarFixed()['left']){
            this.q.os.ui.hideSideBar('left');
          }
          this.cd.detectChanges();
        }
    }
    channelIsSelected = "active-channel";
    selectedChannel;
    getSelected(){
      return JSON.stringify(this.selectedChannel);
    }

    DEVMODE = swarmJson['dev'];
  customColumn = 'name';


    items = [
        { title: 'New Favorite Folder' },
        { title: 'Add Favorite' },
      ];




getFavoriteFolderListTreeChildrenRec(data){
  let chFL = [];
  for(let i=0;i<data.length;i++){
      console.log(data[i]);
      let kind = "dir";
      if(data[i]['item'].indexOf('-----') > -1){
        kind = "channel";
      }
      let children = [];
      if(typeof data[i]['children'] != 'undefined' && data[i]['children']['length'] > 0){
        children = this.getFavoriteFolderListTreeChildrenRec(data[i]['children']);
      }
      chFL.push({ id: data[i]['item'], data: { name: this.q.os.bee.config.getFavoriteFolderNameFromId(data[i]['item']), kind: kind, items: 0 }, children: children } );
  }
  return chFL;

}

  restoreExpandedNodes() {
    this.sENwriteBlock = 1;
    for(let i=0;i<this.expandedNodes.length;i++) {
      let node = this.expandedNodes[i];
      console.log(node);
      console.log(this.treeControl.dataNodes);
        this.treeControl.expand(this.treeControl.dataNodes.find(n => n['item'] === node.item));
    }
    this.sENwriteBlock = 0;
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
  qrSuccessHandler(event){
    console.log(event);
    this.inviteCodeHex = event;
    this.closePopup();
  }

  favoriteFolderList;
  favoriteFolderListArray = [];
  newFavoriteFolder;
  getFavoriteFolderList(){
    this.favoriteFolderList = this.q.os.bee.config.getFavoriteFolderList();
    this.favoriteFolderListArray = [];
    this.parseStructure(this.favoriteFolderList);
    if(this.favoriteFolderListArray.length > 0){
      this.newFavoriteFolder = this.favoriteFolderListArray[0];
    }
    return this.favoriteFolderList;
  }
  parseStructure(folderStructure){
    for(let i=0;i<folderStructure.length;i++){
      if(folderStructure[i]['data']['name'].indexOf('-----') === -1 && folderStructure[i]['data']['name'] != 'emptyFolder'){
        this.favoriteFolderListArray.push(folderStructure[i]);
        if(typeof(folderStructure[i]['children']) != 'undefined'){
          this.parseStructure(folderStructure[i]['children']);
        }
      }
    }
    return folderStructure;
  }
  newChannelFolderChanged(){}


  async createNewChannel(event){
    // this.saveExpandedNodes();
    //
    // console.log(event);
    // let channelNameDirty = event
    // //TODO put together folder structure...
    // let folders;
    //
    // this.ui.showSnack('Creating Channel...','Please Wait');
    // let parentFolderId =  this.newChannelFolder;
    // if(typeof parentFolderId === 'object'){
    //   parentFolderId = "";
    // }
    //
    // await this.q.os.channel.create(channelNameDirty, parentFolderId);
    // this.createCompleteAndClose();
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

  createCompleteAndClose(){
    this.ui.delay(1000);
    this.q.os.bee.config.commit();
    this.ui.showSnack('Success!','Yesss',{duration:1000});
    this.closePopup();
  }


  @ViewChild('newFavoriteFolder') newFavoriteFolderPop;
  newFavoriteFolderName;
  newFavoriteFolderId;
  createNewFavoriteFolder(folderNameDirty){

    this.saveExpandedNodes();

    this.ui.showSnack('Creating Folder...','Please Wait');
    let parentFolderId =  this.newFavoriteFolderId;
    if(typeof parentFolderId === 'object'){
      parentFolderId = "";
    }
    this.q.os.bee.config.createFavoriteFolder(folderNameDirty, parentFolderId);
    this.createCompleteAndClose();
  }

  deleteFolder(folderId){
    // TODO:
    console.log('Deleting Folder...');
    console.log(folderId);
    let hasChannels = this.q.os.bee.config.checkIfFavoriteFolderIdChannels(folderId);
    console.log(hasChannels)
    if(hasChannels){
      this.ui.showSnack('Folder has channels!','Sorry but no.', {duration: 5000});
    }
    else{
      this.ui.showSnack('Deleting Folder...','Please Wait');
      this.saveExpandedNodes();
      this.q.os.bee.config.deleteFavoriteFolder(folderId);
      this.createCompleteAndClose();
    }
  }

  // @ViewChild('import') importPop;
  // importFolderStructure = 1;
  inviteCodeHex;
  importChannelFolderChanged(){}
  async importNewChannel(invite = "NoInviteSelected"){
    this.saveExpandedNodes();
    //TODO put together folder structure...
    this.ui.showSnack('Importing Channel...','Please Wait');

    if(invite == "NoInviteSelected"){
      invite = this.inviteCodeHex;
    }

    let link = Buffer.from(invite,'hex').toString('utf8');
    let channelName;
    let inviteToken;

    let folders = link.split("/////");
    if(folders.length > 0){
      channelName = folders[folders.length-1].split(':')[0];
      inviteToken =  folders[folders.length-1].split(':')[1];
      folders.pop();
    }
    else{
       channelName = link.split(':')[0];
       inviteToken = link.split(':')[1];
    }

    let parentFolderId =  this.newFavoriteFolder;
    if(typeof parentFolderId === 'object' || typeof parentFolderId == 'undefined' || typeof parentFolderId == null){
      parentFolderId = "";
    }

    if(this.q.os.utilities.inArray(this.q.os.ocean.dolphin.getChannelNameList(),channelName)){
      this.ui.showSnack('Channel Exists!','Oops',{duration:1000});
    }
    else{
      this.q.os.ocean.dolphin.removeIncomingFavoriteRequest(channelName.split("-----")[0].split('-')[1]);
      this.q.os.social.profile.addFavorite(channelName.split("-----")[0].split('-')[1]);
      console.log('ChannelFavorites: Adding Favorite: ',channelName.split("-----")[0].split('-')[1]);
      await this.q.os.channel.import(channelName,folders,"",inviteToken,0);
      // this.q.os.social.profile.removeFavoriteRequest();
      this.createCompleteAndClose();
    }

  }

  rejectRequest(pubKey){
    this.q.os.ocean.dolphin.removeIncomingFavoriteRequest(pubKey);
    this.saveExpandedNodes();
    this.loadChannels(this.favoriteFolderList);
    this.q.os.commitNow();
  }


  newInviteImportFoldersChanged(){}

  goToProfile(pubKey){
  //select this profile
  this.ngZone.run(() => this.router.navigate(['/social/profile/'+pubKey]));

  }

  flatChannelNameList = {};
  flatChannelNameList2 = {};

  async updateNames(){

    let channelsHandled = [];

    for(let c of this.flatChannelNeeded){
      if(channelsHandled.indexOf(c) < 0){
        let name = await this.q.os.social.getAliasFromDirectChannel(c);
        console.log(name);
        channelsHandled.push(c);
        this.flatChannelNameList[c] = name;
        this.pk[c] = await this.q.os.social.getPubKeyFromDirectChannel(c);
      }
    }

    for(let c of this.flatChannelNeeded2){
      if(channelsHandled.indexOf(c) < 0){
        let name = await this.q.os.social.getAliasFromDirectChannel2(c);
        console.log(name);
        channelsHandled.push(c);
        this.flatChannelNameList2[c] = name;
        this.pk[c] = await this.q.os.social.getPubKeyFromDirectChannel(c);
      }
    }


    this.cd.detectChanges();

  }
  flatChannelNeeded = [];
  public getAliasFromDirectChannel(channel){
    this.flatChannelNeeded.push(channel);
    if(typeof this.flatChannelNameList[channel] != 'undefined'){
    return this.flatChannelNameList[channel];
  }else{return channel;}
  }

  flatChannelNeeded2 = [];
  public getAliasFromDirectChannel2(channel){
    this.flatChannelNeeded2.push(channel);
    if(typeof this.flatChannelNameList2[channel] != 'undefined'){
    return this.flatChannelNameList2[channel];
  }else{return channel;}
  }

   pubKeyStore = {}

   getPubKeyFromDirectChannel(channel){
     setTimeout( async() => {
       this.pubKeyStore[channel] = await this.q.os.social.getPubKeyFromDirectChannel(channel);
     },2000);

     if(this.pubKeyStore[channel] != undefined){
       return this.pubKeyStore[channel];
     }
     else{
       return '/';
     }
  }

  public selectProfile(pubKey){
    this.ngZone.run(() => this.router.navigate(['/social/profile/'+pubKey]));

  }

  public goToChannel(channel){
    this.q.os.channel.select(channel);
    this.ngZone.run(() => this.router.navigate(['/messages']));
  }

  pk = {};

  async  goToProfileByChannel(channel){
    let pk = await this.q.os.social.getPubKeyFromDirectChannel(channel);
    this.pk[channel] = pk;
      this.ngZone.run(() => this.router.navigate(['/social/profile/'+pk]));

  }

}
