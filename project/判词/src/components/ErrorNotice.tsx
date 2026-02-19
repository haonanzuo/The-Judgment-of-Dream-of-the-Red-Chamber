type ErrorNoticeProps = {
  message: string;
};

export function ErrorNotice({ message }: ErrorNoticeProps) {
  return (
    <div role="alert" className="error-notice">
      <strong>请求失败：</strong>
      <span>{message}</span>
    </div>
  );
}
