This component is developed to show text label.

tailwind v4 is needed to run this component.

a default tailwind based style "label-default" is coded in /style/Style.css 
    above will be aplied if no style class passed in props.

dir and file structure that is followed to code this component
    dir:label
            -dir:interfaces
                -file:Ilabel.ts  <!--Interface needed to handle props-->
            -dir:sampleData
                -file:TestJson.ts  <!--sample data to test-->
            -dir:style
                -file:Style.css <!--default styles-->
            -dir:test
                -file:TestContainer.tsx <!--to show test example of component-->
            -file:Label.tsx  <!--main component entry file-->
            -file:ReadMe.md <!--to component details-->

*this component needed tailwindcss use below link to how 
https://tailwindcss.com/docs/installation/using-vite
and
npm install tailwindcss @tailwindcss/vite 

to use tailwindcss

changes: