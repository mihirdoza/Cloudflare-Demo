import { IbaseListBox } from "../interfaces/IbaseListBox";

export const PsrBaseListBox = (baseListBoxProps: IbaseListBox) => {
  return (
    <>
      <div className="psr-list-box-container">
        {baseListBoxProps.allowFilter && (
          <div className="psr-list-box-search-form">
            <div className="relative">
              <input
                type="search"
                id="default-search"
                className="psr-list-box-search-input"
                autoFocus={true}
                placeholder={"Enter keyword to Search"}
                inputMode="search"
                value={baseListBoxProps.inputValue}
                onInput={baseListBoxProps.handleInputEvent}
                required
              />
              <button type="button" className="psr-list-box-search-button" disabled>
                <svg
                  className="psr-list-box-search-icon-svg"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <ol title={baseListBoxProps.tooltip} className="psr-list-box-list">
          {baseListBoxProps.filteredList.map((item: string, index: number) => {
            return (
              <li
                key={`item-${item}`}
                className={` ${
                  item === baseListBoxProps.value ? "bg-gray-100" : ""
                }`}
                onClick={(event: React.MouseEvent<Element>) =>
                  baseListBoxProps.handleListItemClick(event, index, item)
                }
              >
                {item}
              </li>
            );
          })}
        </ol>
      </div>
      <p
        style={{
          margin: "0",
          marginLeft: "14px",
          color: "#d32f2f",
          fontSize: "12px",
        }}
      >
        {baseListBoxProps.errorMessage}
      </p>
    </>
  );
};
