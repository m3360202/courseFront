import { useEffect } from 'react'
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import { UseFormSetValue } from 'react-hook-form'

//@ts-ignore
const useDescription = <T>(value: EditorState | undefined, setValue: UseFormSetValue<T>) => {
  useEffect(() => {
    if (value) {
      const descriptionObj = convertToRaw(value?.getCurrentContent())
      const description = draftToHtml(
        convertToRaw(EditorState.createWithContent(convertFromRaw(descriptionObj)).getCurrentContent())
      )
      //@ts-ignore
      setValue('descriptionObj', descriptionObj)
      //@ts-ignore
      setValue('description', description)
    }
  }, [value])
}

export default useDescription
