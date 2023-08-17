export default function WizCard({children, className}) {
    return (
        <div className={className + " wiz-card"}>
            {children}
        </div>
    )
}