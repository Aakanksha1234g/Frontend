export const castSlideTemplate = {
  template_id: 2,
  template_url: "/pitch_craft/cast_template.jpg",
  template_title: "Cast & Crew",
  template: [
    {
      slide_id: 1,
      slide_type: "cast",
      json: JSON.stringify({ objects: [] }),
    },
  ],

  createSlideFunction: ({ idx, slide_type, cast = {} }) => {
    const canvasWidth = 1344;
    const canvasHeight = 768;

    const safeCast = {
      characterName: "",
      actorName: "",
      role: "",
      gender: "",
      age: "",
      height: "",
      weight: "",
      description: "",
      imageUrl: "",
      ...cast,
    };

    // Base design background and layout
    const baseDesign = JSON.parse(`{
      "version":"5.5.2",
      "objects":[
        {"type":"rect","left":-4.4,"top":-7.02,"width":120,"height":80,"fill":"#FFFEFFFF","stroke":"#FFFEFFFF","strokeWidth":5,"scaleX":11.24,"scaleY":9.36},
        {"type":"rect","left":-7.24,"top":83.7,"width":1357.64,"height":618.33,"fill":"#506536FF","stroke":"#FFFEFFFF","strokeWidth":5},
        {"type":"textbox","originX":"center","left":664.61,"top":29.63,"width":1184.68,"height":33.9,"fill":"#000000FF","fontFamily":"Delius Unicase","fontWeight":"bold","fontSize":30,"text":"Cast & Crew"}
      ],
      "background":"#1a1a1a"
    }`);

    const objects = baseDesign.objects.map((obj) => {
      if (obj.type === "textbox" && !obj.styles) obj.styles = {};
      return obj;
    });

    // === 🎬 Add Cast Image (Fabric-like behavior) ===
    if (safeCast.imageUrl) {
      // Simulate how fabric.Image.fromURL adds an image with scaling
      const imageObject = {
        type: "image",
        version: "5.5.2",
        originX: "left",
        originY: "top",
        left: 80, // same as fabric random positions but static here for layout
        top: 150,
        scaleX: 0.5, // matches how useImageActions sets initial scale
        scaleY: 0.5,
        angle: 0,
        opacity: 1,
        src: safeCast.imageUrl,
        crossOrigin: "anonymous",
      };
      objects.push(imageObject);
    }

    // === 📝 Dynamic Text Fields ===
    const textFields = [
      {
        text: safeCast.actorName || "Actor Name",
        left: 520,
        top: 150,
        fontSize: 50,
        fill: "#ffffff",
        fontFamily: "Comic Relief",
        fontWeight: "bold",
      },
      {
        text: safeCast.characterName || "Character Name",
        left: 800,
        top: 210,
        fontSize: 40,
        fill: "#dddddd",
        fontFamily: "Comic Relief",
        fontWeight: "bold",
      },
      {
        text: `Role: ${safeCast.role || "N/A"}`,
        left: 530,
        top: 270,
        fontSize: 26,
        fill: "#cccccc",
        fontFamily: "Comic Relief",
      },
      {
        text: `Gender: ${safeCast.gender || "N/A"}`,
        left: 530,
        top: 320,
        fontSize: 26,
        fill: "#cccccc",
        fontFamily: "Comic Relief",
      },
      {
        text: `Age: ${safeCast.age || "N/A"}`,
        left: 760,
        top: 320,
        fontSize: 26,
        fill: "#cccccc",
        fontFamily: "Comic Relief",
      },
      {
        text: `Height: ${safeCast.height || "N/A"}`,
        left: 530,
        top: 370,
        fontSize: 26,
        fill: "#cccccc",
        fontFamily: "Comic Relief",
      },
      {
        text: `Weight: ${safeCast.weight || "N/A"}`,
        left: 760,
        top: 370,
        fontSize: 26,
        fill: "#cccccc",
        fontFamily: "Comic Relief",
      },
    ];

    textFields.forEach((field) => {
      objects.push({
        type: "textbox",
        version: "5.5.2",
        originX: "left",
        originY: "top",
        left: field.left,
        top: field.top,
        width: 600,
        fontSize: field.fontSize,
        fontWeight: field.fontWeight || "normal",
        fill: field.fill,
        text: field.text,
        fontFamily: field.fontFamily,
        styles: {},
      });
    });

    // === 🗒️ Character Description ===
    if (safeCast.description) {
      objects.push({
        type: "textbox",
        version: "5.5.2",
        originX: "left",
        originY: "top",
        left: 530,
        top: 440,
        width: 620,
        fontSize: 22,
        fill: "#aaaaaa",
        text: safeCast.description,
        fontFamily: "Comic Relief",
        lineHeight: 1.3,
        styles: {},
      });
    }

    // === 🧩 Return Slide Object ===
    return {
      slide_id: idx,
      slide_type,
      json: JSON.stringify({
        version: "5.5.2",
        objects,
        backgroundColor: baseDesign.background,
      }),
      hasContent: true,
    };
  },
};
