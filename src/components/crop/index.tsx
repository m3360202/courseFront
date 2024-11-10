import { useState, useRef, useEffect } from 'react'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import { LoadingButton } from '@mui/lab'

export default function Crop({
  file,
  onUploadHandle,
  loading,
  aspectRatio
}: {
  file?: File
  onUploadHandle: (file: File) => void
  loading: boolean
  aspectRatio?: number
}) {
  const imgRef = useRef<any>(null)
  const [upImg, setUpImg] = useState()

  useEffect(() => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        const imageSrc = e.target.result // 获取DataURL
        setUpImg(imageSrc)
      }
      reader.readAsDataURL(file) // 将文件转换为DataURL
    }
  }, [file])

  return (
    <div>
      {/**@ts-ignore */}
      {/* <ReactCrop src={upImg} crop={crop} onChange={(c: any) => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1}> */}
      {/* <img src={upImg} ref={imgRef} /> */}
      <Cropper
        src={upImg}
        ref={imgRef}
        initialAspectRatio={aspectRatio}
        aspectRatio={aspectRatio}
        zoomable={false}
        // autoCropArea={2}
        // checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
      />
      {/* </ReactCrop> */}
      {/* <div style={{ textAlign: 'center' }}>
        <canvas
          ref={previewCanvasRef}
          style={{
            width: Math.round(completedCrop?.width ?? 0),
            height: Math.round(completedCrop?.height ?? 0)
          }}
        />
      </div> */}
      {/* {progressNumber > 0 && (
        <Grid container pt={4} spacing={4}>
          <Grid item xs={12}>
            <LinearProgress variant='determinate' sx={{ height: 10 }} value={progressNumber} />
            {`${progressNumber}%`}
          </Grid>
         
        </Grid>
      )} */}
      <LoadingButton
        variant='contained'
        sx={{ mt: 4 }}
        loading={loading}
        fullWidth
        onClick={() => {
          //  const a= imgRef?.current?.cropper.getCroppedCanvas().toDataURL()
          //  //setImg(a)
          // const newFile = dataURLtoFile(imgRef?.current?.cropper.getCroppedCanvas().toDataURL(), file?.name || '') //generateFile(previewCanvasRef.current, completedCrop, file?.name || '')

          // console.log(newFile);
          const cropper = imgRef?.current?.cropper
          if (cropper) {
            cropper
              //.getCroppedCanvas({ maxWidth: 1600, imageSmoothingEnabled: false, imageSmoothingQuality: 'high' })
              .getCroppedCanvas()
              .toBlob((blob: Blob) => {
                if (blob) {
                  const newFile = new File([blob], file?.name as string, {
                    lastModified: Date.now(),
                    type: blob.type
                  })
                  console.log(newFile)
                  onUploadHandle(newFile)
                  // const result = { fileIndex, file: fileTemp }
                  // hasNext ? onNext(result) : onSubmit(fileTemp)
                  // //把选中裁切好的的图片传出去
                  // // 关闭弹窗
                  // !hasNext && onClose()
                }
                //}, 'image/jpeg')
              }, 'image/jpeg')
          }
          //onUploadHandle(newFile)
        }}
      >
        Confirm
      </LoadingButton>
    </div>
  )
}
