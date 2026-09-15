import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react';

type Props = {
  onEmojiClick: (emoji: EmojiClickData) => void;
  width?: number;
  height?: number;
  searchPlaceHolder?: string;
  searchDisabled?: boolean;
  skinTonesDisabled?: boolean;
  lazyLoadEmojis?: boolean;
};

export default function LazyEmojiPicker(props: Props) {
  return <EmojiPicker {...props} theme={Theme.AUTO} />;
}
