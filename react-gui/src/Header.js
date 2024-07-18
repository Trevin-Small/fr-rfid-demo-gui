const Header = ({title}) => {
    return (
        <header className="w-full h-20 flex flex-row justify-start items-center" style={{backgroundColor:"#bfe8fd"}}>
            <div className="flex flex-row justify-start w-1/3 h-full">
                <img src="./assets/logo.png" className="w-auto h-3/4 mx-2 mt-2" alt="logo" />
            </div>
            <div className="flex flex-row justify-center items-center text-center w-1/3">
                <p className="text-4xl font-bold mb-2">{title}</p>
            </div>
            <div className="flex flex-row justify-end items-center w-1/3">
                <a href="/" className="mr-4"><p className="text-lg font-semibold">Inventory</p></a>
                <a href="/graphs" className="mr-4"><p className="text-lg font-semibold">Graphs</p></a>
            </div>
        </header>
    );

};

export default Header;