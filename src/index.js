import './styles.css';
import "./prosemirror.css";
import 'tippy.js/dist/svg-arrow.css';
import 'tippy.js/animations/scale-subtle.css';
import "react-datepicker/dist/react-datepicker.css";
import "./page-styles.scss";
 
import EditorWrapper from './EditorWrapper';
import MenuFloating from './Menus/FloatingMenu';
import ImageMenu from './Menus/ImageMenu';
import Cite from './CustomExtensions/Cite'
import Iframe from './CustomExtensions/Iframe/Iframe'
import { Blockquote } from './CustomExtensions/CustomBlockquote';
import {Image} from './CustomExtensions/Figure2/CustomImage'
import Figure from './CustomExtensions/Figure2/Figure'
import FigCaption from './CustomExtensions/Figure2/Figcaption';
import {PasteFilter} from './CustomExtensions/PasteFilter'
import Tweet from './CustomExtensions/Tweet/Tweet'
import LinkEmbed from './CustomExtensions/LinkEmbed/LinkEmbed';
import Video from './CustomExtensions/Video/Video';
import VideoMenu from './Menus/VideoMenu';
import { addTwitterScript } from './editorHooks/libs/addTwitterScript';
import UndoRedoButtons from './UndoRedoButtons';
import EditorNavButtons from './EditorNavButtons';
import LinkInput from './Menus/MenuButtons/LinkDropdown/LinkButtonRadix';


export default EditorWrapper;

export {
  MenuFloating,
  ImageMenu,
  VideoMenu,
  Cite,
  Iframe,
  Blockquote,
  Image,
  Figure,
  FigCaption,
  PasteFilter,
  Tweet,
  LinkEmbed,
  Video,
  addTwitterScript,
  UndoRedoButtons,
  EditorNavButtons,
  LinkInput
};