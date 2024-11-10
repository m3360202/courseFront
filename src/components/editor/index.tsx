import { UserTable } from '@/types/user/UserTable'
import { updateLoadImage } from '@/utils/uploadFile'
import dynamic from 'next/dynamic'
import { EditorProps, EditorState } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

const ReactDraftWysiwyg = dynamic<EditorProps>(() => import('react-draft-wysiwyg').then(mod => mod.Editor), {
  ssr: false
})


const Editor = ({ placeholder, user, value, setContentValue, toolbarCustomButtons }: { placeholder?: string, user: UserTable, value: EditorState | undefined, setContentValue: (value: EditorState | undefined) => void, toolbarCustomButtons?: Array<React.ReactElement<HTMLElement>> | undefined }) => {
  return <ReactDraftWysiwyg
    readOnly={false}
    editorStyle={{
      border: '1px solid rgba(0, 0, 0, 0.23)',
      borderRadius: '6px',
      minHeight: 200,
      maxHeight: 600,
      paddingLeft: '10px'
    }}
    toolbarHidden={false}
    placeholder={placeholder}
    toolbar={{
      image: {
        urlEnabled: false,
        uploadEnabled: true,
        alignmentEnabled: true, // 是否显示排列按钮 相当于text-align
        uploadCallback: async (file: File) => {
          return await updateLoadImage(user as UserTable, file)
        },
        previewImage: true,
        inputAccept: 'image/*',
        imageStyle: {
          // 设置图片的最大宽度为编辑器的宽度
          maxWidth: '100%',
          width: '100%',
          // 你也可以设置其他样式，比如高度或者对象拟合
          objectFit: 'contain', // 保持图片的宽高比，同时完全显示在编辑器内
        },
        alt: { present: false, mandatory: false }
      }
    }}
    editorState={value}
    onEditorStateChange={data => setContentValue(data)}
    toolbarCustomButtons={toolbarCustomButtons}
  />
}

export default Editor
