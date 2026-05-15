import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";



export default function Commonform({ formControls, onSubmit, FormData, setFormData, isDisabled, buttonText }) {
    const Type = {
        INPUT: "Input",
        SELECT: "Select",
        TEXTAREA: "Textarea",
    }
    function formHandler(controlitems) {
        const value = FormData[controlitems.name];
        let element = null;
        switch (controlitems.componenttype) {
            case Type.INPUT:
                element = (
                    <Input
                        name={controlitems.name}
                        placeholder={controlitems.placeholder}
                        id={controlitems.name}
                        type={controlitems.type}
                        value={value}
                        onChange={e =>
                            setFormData({ ...FormData, [controlitems.name]: e.target.value })
                        }
                    />

                )
                break;
            case Type.SELECT:
                element = (
                    <Select
                        onValueChange={(val) =>
                            setFormData({ ...FormData, [controlitems.name]: val })
                        }
                        value={value || ""}
                    >
                        <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900">
                            <SelectValue placeholder={controlitems.placeholder} />
                        </SelectTrigger>

                        <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                            {controlitems.options &&
                                controlitems.options.map((items) => (
                                    <SelectItem key={items.value} value={items.value}>
                                        {items.label}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                )
                break;

            case Type.TEXTAREA:
                element = (
                    <Textarea
                        name={controlitems.name}
                        placeholder={controlitems.placeholder}
                        id={controlitems.id}
                        value={value}
                        onChange={e =>
                            setFormData({ ...FormData, [controlitems.name]: e.target.value })
                        }
                    />
                );
                break;

            default:
                element = (
                    <Input
                        name={controlitems.name}
                        placeholder={controlitems.placeholder}
                        id={controlitems.name}
                        type={controlitems.type}
                        value={value}
                        onChange={e =>
                            setFormData({ ...FormData, [controlitems.name]: e.target.value })
                        }
                    />
                );
                break;
        }

        return element;
    }



    return (
        <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-2">
                {formControls.map((controlitems) => (
                    <div className="grid w-full gap-1.5" key={controlitems.name}>
                        <Label>{controlitems.label}</Label>
                        {formHandler(controlitems)}
                    </div>
                ))}
            </div>
            <Button className="w-full bg-black
             p-3 text-white mt-3" type="submit" disabled={isDisabled}>
                {buttonText || "Submit"}
            </Button>
        </form>
    )
}