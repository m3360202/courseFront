interface RemixIconProps {
  icon: string | undefined;
  sx?: React.CSSProperties;
}

export const RemixIcon: React.FC<RemixIconProps> = ({ icon, sx }) => {

  return (
    <i className={`${icon} text-xl text-textSecondary`} style={sx} />
  );
};
