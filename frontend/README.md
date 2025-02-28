## This Project is initiated to develop UI Components using Vite+React+TypeScript+Css.

check components directory for developed components.
structure that is followed to code components
        dir:[componentName]
                -dir:interfaces  <!--to write all the intefaces if needed-->
                    -file:I[interfaceName].ts
                -dir:sampleData
                    -file:[DataFileName].ts <!--to provide sample data to test-->
                -dir:style
                    -file:[Style].css <!--to write default style if needed-->
                -dir:test
                    -file:TestContainer.tsx
                -file:[ComponentName].tsx <!--main component entry file-->
                -dir:[subComponentName] <!--to write/put any Sub component needed-->
                    -file:[SubComponentName].tsx
                -dir:subComponents <!--to write/put any Sub components needed-->
                    -file:[SubComponentName].tsx
                -file:ReadMe.md <!--to provide component level details-->

List of components:

0. ThemeSwitch : to switch webApp theme between light,dark, system. to use Load selected theme across WebApp call component in App.tsx
1. psr: to show JSON.
2. psrh: to show JSON in horizontal split pane.
3. psrv: to show JSON in vertical split pane.
4. label: to show Text in label.
5. image: to show image.
6. actionLabel: to show TextLabel,image(optional) in label with click action.
7. faqs: to show FAQs.
8. table: to show data in table.

# NewAdded: 13-02-2025
9. actionImage: to show Image,label(optional) in label with click action.
10. actionImageList: to show ActionImage in list with current selected option.
11. actionImageStrip: to show ActionImage in strip.

# NewAdded: 14-02-2025
12. ActionImageStripDND
13. ActionLabelStrip
14. ActionListControl
15. ConfirmYesNo: Using Tailwind
16. ResizablePane

-------------------------------------------------------------------------------------------------------------------

# changes: 13-02-2025
/src/psrStyles/ directory is used to load screen responsive text-size, image-size
- Text.css 4 text sizes is set that will be used across component.
- Image.css 4 sizes is set that will be used across component.
- Label.css to control label element.
- Table.css to control table element.
- HtmlTexts.css to control other text element like p, li, h1, h2, h3, h4, h5.

# changes: 14-02-2025
- new Theme.css to control text and other color across webapp.
- HtmlOtherElement.css to control other component style.

-------------------------------------------------------------------------------------------------------------------
#ToDo: need to code css for dark and light theme.

-------------------------------------------------------------------------------------------------------------------
*Some Component may need their own depdencies

like: 
"npm i react-json-view-lite" to View JSON, 
    used in psr/myJsonViewer/MyJsonViewer.tsx,
    psrh/myJsonViewer/MyJsonViewer.tsx,
    psrv/myJsonViewer/MyJsonViewer.tsx

"npm i primereact" to view split pane. used in psrh, psrv.

each component have their own README.md for more clarity.