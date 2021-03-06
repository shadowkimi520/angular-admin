import {
  AfterViewInit,
  ViewChild,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';

const marked = require('marked');
const hljs = require('highlight.js');
const CodeMirror = require('codemirror');
const { store } = require('./libs/store.js');

(<any>window).hljs = hljs;
(<any>window).store = store;
(<any>window).marked = marked;
(<any>window).CodeMirror = CodeMirror;

require('codemirror/mode/meta.js');
require('codemirror/mode/go/go.js');
require('codemirror/mode/gfm/gfm.js');
require('codemirror/mode/vue/vue.js');
require('codemirror/mode/css/css.js');
require('codemirror/mode/lua/lua.js');
require('codemirror/mode/php/php.js');
require('codemirror/mode/xml/xml.js');
require('codemirror/mode/jsx/jsx.js');
require('codemirror/mode/sql/sql.js');
require('codemirror/mode/pug/pug.js');
require('codemirror/mode/lua/lua.js');
require('codemirror/mode/sass/sass.js');
require('codemirror/mode/http/http.js');
require('codemirror/mode/perl/perl.js');
require('codemirror/mode/ruby/ruby.js');
require('codemirror/mode/nginx/nginx.js');
require('codemirror/mode/shell/shell.js');
require('codemirror/mode/clike/clike.js');
require('codemirror/mode/stylus/stylus.js');
require('codemirror/mode/python/python.js');
require('codemirror/mode/haskell/haskell.js');
require('codemirror/mode/markdown/markdown.js');
require('codemirror/mode/htmlmixed/htmlmixed.js');
require('codemirror/mode/javascript/javascript.js');

require('codemirror/addon/mode/overlay.js');
require('codemirror/addon/edit/closetag.js')
require('codemirror/addon/edit/continuelist.js');
require('codemirror/addon/edit/closebrackets.js');
require('codemirror/addon/scroll/annotatescrollbar.js')
require('codemirror/addon/selection/active-line.js');
require('codemirror/addon/selection/mark-selection.js');
// require('codemirror/addon/search/searchcursor.js');
// require('codemirror/addon/search/matchesonscrollbar.js')???
// require('codemirror/addon/search/searchcursor.js');
// require('codemirror/addon/search/match-highlighter.js');
require('codemirror/addon/fold/foldcode.js');
require('codemirror/addon/fold/xml-fold.js');
require('codemirror/addon/fold/foldgutter.js');
require('codemirror/addon/fold/comment-fold.js');
require('codemirror/addon/fold/indent-fold.js');
require('codemirror/addon/fold/brace-fold.js');
require('codemirror/addon/fold/markdown-fold.js');

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  highlight(code, lang, callback) {
    return hljs.highlightAuto(code).value;
  }
});

@Component({
  selector: 'markdown-editor',
  template: require('./markdownEditor.html'),
  styles: [
    require('./markdownEditor.component.scss'),
    require('highlight.js/styles/ocean.css'),
    require('codemirror/lib/codemirror.css'),
    require('codemirror/theme/base16-dark.css'),
    require('codemirror/addon/fold/foldgutter.css')
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => BaMarkdownEditorComponent),
    multi: true
  }],
  encapsulation: ViewEncapsulation.None
})
export class BaMarkdownEditorComponent implements AfterViewInit, ControlValueAccessor {

  @ViewChild('bakModal') bakModal: ModalDirective;

  // ????????????
  editor:any;
  content:any = '';
  markedHtml:any = '';
  editorElem:HTMLElement;

  previewMode:number = 0;
  fullscreen:any = false;

  // ????????????
  @Input() config: Object;

  // ????????????
  @Output() ready: EventEmitter<any> = new EventEmitter();
  @Output() change: EventEmitter<any> = new EventEmitter();

  // ...
  onModelChange: Function = () => {};
  onModelTouched: Function = () => {};

  public timer = null;

  // ??????Dom
  constructor(private elementRef: ElementRef) {}

  // ??????????????????
  useArticleBak() {
    this.content = store.get(location.pathname);
    this.editor.setValue(this.content);
    this.markedHtml = marked(this.content);
    this.bakModal.hide();
  }

  // ??????????????????
  cancelBakModal() {
    this.editor.setValue(this.content);
    this.markedHtml = marked(this.content);
    this.bakModal.hide();
  }

  // ????????????????????????????????????
  ngAfterViewInit() {
    if (this.editor) {
      return false;
    }

    this.editorElem = this.elementRef.nativeElement.children[0].children[1].children[0].children[0];
    this.editor = CodeMirror.fromTextArea(this.editorElem, Object.assign({
      // ???????????? github markdown??????
      mode: 'gfm',
      // ??????
      lineNumbers: true,
      // ??????????????????
      matchBrackets: true,
      // ????????????
      lineWrapping: false,
      // ??????????????????
      styleActiveLine: true,
      // ??????
      theme: 'base16-dark',
      // ??????????????????
      autoCloseBrackets: true,
      // ??????????????????
      autoCloseTags: true,
      // ??????????????????????????????
      // styleSelectedText: true,
      // highlightSelectionMatches: { showToken: /w/, annotateScrollbar: true },
      // ????????????
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      // ????????????????????????????????????
      extraKeys: { 
        "Enter": "newlineAndIndentContinueMarkdownList"
      }
    }, this.config));

    this.editor.on('blur', cm => {
      this.onModelTouched();
    });

    this.editor.on('change', cm => {
      const content = cm.getValue();
      if(!Object.is(content, this.content)) {
        this.content = content;
        this.change.emit({
          editor: this.editor,
          content: this.content
        });
        this.onModelChange(this.content);
        if(this.previewMode != 0) {
          this.parseMarked();
          // console.log('???????????????????????????????????????');
        }
      }
      // ??????????????????
      if (!!this.timer) clearTimeout(this.timer);
      if(!Object.is(content, store.get(location.pathname))) {
        this.timer = setTimeout(() => {
          store.set(location.pathname, content)
        }, 1600);
      };
    });

    // ???????????????????????????????????????????????????????????????
    if(['/article/post', '/announcement'].includes(location.pathname)) {
      let bak = store.get(location.pathname);
      if(!!bak) {
        this.content = bak;
        this.editor.setValue(this.content);
        // this.markedHtml = marked(this.content);
      }
    } else {
    // ????????????????????????????????????????????????
      setTimeout(() => {
        if(!this.bakModal.isShown) {
          this.editor.setValue(this.content);
          this.markedHtml = marked(this.content);
        }
      }, 1000)
    }
    
    /*
    const dropZone = this.elementRef.nativeElement.children[0].children[1];
    dropZone.addEventListener('drop', event => {
      event.preventDefault();
      event.stopPropagation();
      let reader = new FileReader();
      reader.onload = e => {
        console.log(e);
        // this.editor.setValue(e.target.result);
      };
      reader.readAsText(event.dataTransfer.files[0]);
    }, false);
    */
  }

  // ??????markeddown
  parseMarked() {
    this.markedHtml = marked(this.content);
  }

  // ?????????
  writeValue(currentValue: any) {
    const bak = store.get(location.pathname);
    if (!Object.is(currentValue, undefined) && !Object.is(currentValue, this.content)) {
      // ?????????????????????????????????
      if(Object.is(location.pathname, '/announcement')) {
        this.content = currentValue;
        this.editor.setValue(this.content);
        return false;
      }
      if (!!bak && !Object.is(currentValue, bak)) {
        this.bakModal.show();
      }
      this.content = currentValue;
    } else if (!!bak) {
      this.content = bak;
    }
  }

  // ????????????
  saveFile(code, name) {
    const blob = new Blob([code], { type: 'text/plain' });
    if ((<any>window).saveAs) {
      (<any>window).saveAs(blob, name);
    } else if ((<any>navigator).saveBlob){
      (<any>navigator).saveBlob(blob, name);
    } else {
      const url = URL.createObjectURL(blob);
      let link = document.createElement("a");
      link.setAttribute("href",url);
      link.setAttribute("download",name);
      let event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, true, (<any>window), 1, 0, 0, 0, 0, false, false, false, false, 0, null);
      link.dispatchEvent(event);
    }
  }

  // ?????????markdown
  saveAsMarkdown(){
    this.saveFile(this.content, "untitled.md");
  }

  // ??????listen
  keyDownListen(event) {

    // ????????????
    if(Object.is(event.keyCode, 27)) {
      this.fullscreen = false;
    }

    // ??????
    if(Object.is(event.keyCode, 122)) {
      this.fullscreen = !this.fullscreen;
    }

    // ??????
    if(event.keyCode == 83 && (event.ctrlKey || event.metaKey || event.shiftKey)){
      this.saveAsMarkdown();
      event.preventDefault();
      return false;
    }
  }

  // ????????????
  updateCodeMirror(data) {
    const codemirror = this.editor;
    codemirror.replaceSelection(data);
    const startPoint = codemirror.getCursor('start');
    const endPoint = codemirror.getCursor('end');
    codemirror.setSelection(startPoint, endPoint);
    codemirror.focus();
    /*
    let doc = codemirror.getDoc();
    let cursor = doc.getCursor(); // gets the line number in the cursor position
    let line = doc.getLine(cursor.line); // get the line contents
    let pos = { // create a new object to avoid mutation of the original selection
      line: cursor.line,
      ch: line.length - 1 // set the character position to the end of the line
    }
    doc.replaceRange('\n' + data + '\n', pos); // adds a new line
    */
  }

  // ???????????????????????????
  replaceSelection(cm, active, start, end) {
    let text;
    let startPoint = cm.getCursor('start');
    let endPoint = cm.getCursor('end');
    if (active) {
      text = cm.getLine(startPoint.line);
      start = text.slice(0, startPoint.ch);
      end = text.slice(startPoint.ch);
      cm.setLine(startPoint.line, start + end);
    } else {
      text = cm.getSelection();
      cm.replaceSelection(start + text + end);
      startPoint.ch += start.length;
      endPoint.ch += start.length;
    }
    cm.setSelection(startPoint, endPoint);
    cm.focus();
  }

  // ????????????????????????????????????
  getState(cm, pos) {
    pos = pos || cm.getCursor('start');
    let stat = cm.getTokenAt(pos);
    if (!stat.type || !stat.type.split) return {};
    let types = stat.type.split(' ');
    let ret = {}, data, text;
    for (let i = 0; i < types.length; i++) {
      data = types[i];
      if (data === 'strong') {
        (<any>ret).bold = true;
      } else if (data === 'letiable-2') {
        text = cm.getLine(pos.line);
        if (/^\s*\d+\.\s/.test(text)) {
          ret['ordered-list'] = true;
        } else {
          ret['unordered-list'] = true;
        }
      } else if (data === 'atom') {
        (<any>ret).quote = true;
      } else if (data === 'em') {
        (<any>ret).italic = true;
      }
    }
    return ret;
  }

  // ??????
  toggleBold() {
    const codemirror = this.editor;
    const stat = this.getState(codemirror, codemirror.getCursor());

    let text;
    let start = '**';
    let end = '**';

    let startPoint = codemirror.getCursor('start');
    let endPoint = codemirror.getCursor('end');
    if ((<any>stat).bold) {
      /*
      text = codemirror.getLine(startPoint.line);
      start = text.slice(0, startPoint.ch);
      end = text.slice(startPoint.ch);

      start = start.replace(/^(.*)?(\*|\_){2}(\S+.*)?$/, '$1$3');
      end = end.replace(/^(.*\S+)?(\*|\_){2}(\s+.*)?$/, '$1$3');
      startPoint.ch -= 2;
      endPoint.ch -= 2;
      // console.log('text', text, 'start', start, 'end', end, startPoint, endPoint);
      // codemirror.setLine(startPoint.line, start + end);
      // codemirror.replaceRange(end, endPoint);
      */
    } else {
      text = codemirror.getSelection();
      codemirror.replaceSelection(start + text + end);

      startPoint.ch += 2;
      endPoint.ch += 2;
    }
    codemirror.setSelection(startPoint, endPoint);
    codemirror.focus();
  }

  // ??????
  toggleItalic() {
    const codemirror = this.editor;
    const stat = this.getState(codemirror, codemirror.getCursor());

    let text;
    let start = '*';
    let end = '*';

    let startPoint = codemirror.getCursor('start');
    let endPoint = codemirror.getCursor('end');
    if ((<any>stat).italic) {
      /*
      text = codemirror.getLine(startPoint.line);
      start = text.slice(0, startPoint.ch);
      end = text.slice(startPoint.ch);

      start = start.replace(/^(.*)?(\*|\_)(\S+.*)?$/, '$1$3');
      end = end.replace(/^(.*\S+)?(\*|\_)(\s+.*)?$/, '$1$3');
      startPoint.ch -= 1;
      endPoint.ch -= 1;
      // codemirror.setLine(startPoint.line, start + end);
      */
    } else {
      text = codemirror.getSelection();
      codemirror.replaceSelection(start + text + end);

      startPoint.ch += 1;
      endPoint.ch += 1;
    }
    codemirror.setSelection(startPoint, endPoint);
    codemirror.focus();
  }

  // ????????????
  drawLink() {
    const codemirror = this.editor;
    const position = codemirror.getCursor();
    const stat = this.getState(codemirror, position);
    this.replaceSelection(codemirror, (<any>stat).link, '[', '](https://)');
  }

  // ????????????
  drawImage() {
    const codemirror = this.editor;
    const position = codemirror.getCursor();
    const stat = this.getState(codemirror, position);
    this.replaceSelection(codemirror, (<any>stat).image, '![](', ')');
  }

  // ????????????
  drawQuote() {
    const codemirror = this.editor;
    const position = codemirror.getCursor();
    const stat = this.getState(codemirror, position);
    this.replaceSelection(codemirror, (<any>stat).quote, '> ', '\n');
  }

  // ????????????
  drawCode() {
    const codemirror = this.editor;
    const position = codemirror.getCursor();
    const stat = this.getState(codemirror, position);
    this.replaceSelection(codemirror, (<any>stat).code, '```\n', '\n```');
  }

  // ??????h3??????
  drawH3Title(data) {
    const codemirror = this.editor;
    const position = codemirror.getCursor();
    const stat = this.getState(codemirror, position);
    this.replaceSelection(codemirror, (<any>stat).h3, '### ', '\n');
    // this.updateCodeMirror(data);
  }

  // ??????
  undo() {
    const codemirror = this.editor;
    codemirror.undo();
    codemirror.focus();
  }

  // ??????
  redo() {
    const codemirror = this.editor;
    codemirror.redo();
    codemirror.focus();
  }

  // ????????????
  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  // ????????????
  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }
}
