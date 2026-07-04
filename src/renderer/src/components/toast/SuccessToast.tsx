type SuccessToastProps = {
  message: string
}

export default function SuccessToast({ message }: SuccessToastProps): React.JSX.Element {
  return (
    <div className="font-ui fixed left-1/2 top-5 z-[9999] -translate-x-1/2 border border-cyan-500/60 bg-black/80 px-8 py-3 text-center shadow-[0px_0px_18px_rgba(0,229,255,0.35)] backdrop-blur-sm">
      <p className="text-xl font-bold text-cyan-300">{message}</p>
    </div>
  )
}
