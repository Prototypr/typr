import './styles.css';
import "./prosemirror.css";
import 'tippy.js/dist/svg-arrow.css';
import 'tippy.js/animations/scale-subtle.css';
import "react-datepicker/dist/react-datepicker.css";
import "./page-styles.scss";
 
import EditorWrapper from './EditorWrapper';
import Editor from './Editor/Editor';
import MenuFloating from './Editor/extensions/Menus/FloatingMenu';
import ImageMenu from './Editor/extensions/Menus/ImageMenu';
import Cite from './Editor/extensions/CustomExtensions/Cite'
import Iframe from './Editor/extensions/CustomExtensions/Iframe/Iframe'
import { Blockquote } from './Editor/extensions/CustomExtensions/CustomBlockquote';
import { Image } from "./Editor/extensions/CustomExtensions/Figure2/CustomImage";

import Figure from './Editor/extensions/CustomExtensions/Figure2/Figure'
import FigCaption from './Editor/extensions/CustomExtensions/Figure2/Figcaption';
import {PasteFilter} from './Editor/extensions/CustomExtensions/PasteFilter'
import Tweet from './Editor/extensions/CustomExtensions/Tweet/Tweet'
import LinkEmbed from './Editor/extensions/CustomExtensions/LinkEmbed/LinkEmbed';
import Video from './Editor/extensions/CustomExtensions/Video/Video';
import VideoMenu from './Editor/extensions/Menus/VideoMenu';
import { addTwitterScript } from './editorHooks/libs/addTwitterScript';
import UndoRedoButtons from './Editor/UI/UndoRedoButtons';
import EditorNavButtons from './Editor/UI/EditorNavButtons';
import LinkInput from './Editor/extensions/Menus/MenuButtons/LinkDropdown/LinkButtonRadix';

import { defaultProps } from './config/defaultProps';

export default EditorWrapper;

export { Editor };
export { defaultProps };

export const plugins = {
  //custom plugins
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