import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import React from "react";
import { Autocomplete, Box, Chip, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { createInputGroupTextStyle } from "../../../../styles/formThemeStyles.js";

export default function GeneralTab({ settings, handleFunc, submit }) {
  const theme = useTheme();
  const inputGroupTextStyle = createInputGroupTextStyle(theme);
  const labelStyle = { ...inputGroupTextStyle, minWidth: 200 };
  return (
    <>
      <Container>
        <Form>
          <Row>
            <Col>
              <InputGroup className="mb-3 w-100" size="sm">
                <InputGroup.Text id="settings_default_currency" style={labelStyle}>Default Currency</InputGroup.Text>
                <Form.Control
                  aria-describedby="settings_default_currency"
                  name="default_currency"
                  type="text"
                  placeholder="AED, EUR, USD..."
                  value={settings.default_currency || ""}
                  onChange={handleFunc}
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup className="mb-3 w-100" size="sm">
                <InputGroup.Text id="settings_num_data_per_page" style={labelStyle}>Data Per Page</InputGroup.Text>
                <Form.Control
                  aria-describedby="settings_num_data_per_page"
                  name="num_data_per_page"
                  type="number"
                  placeholder="10, 20, 100..."
                  value={settings.num_data_per_page || ""}
                  onChange={handleFunc}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              {/*<Box sx={{mt: 4}}>*/}
              {/*    <Autocomplete*/}
              {/*        name="associative_categories"*/}
              {/*        defaultValue={applicationSettings?.associative_categories}*/}
              {/*        value={applicationSettings?.associative_categories}*/}
              {/*        multiple*/}
              {/*        options={[]}*/}
              {/*        onChange={(event, newValue) => {*/}
              {/*            setApplicationSettings({*/}
              {/*                ...applicationSettings,*/}
              {/*                ['associative_categories']: newValue || ""*/}
              {/*            })*/}

              {/*        }}*/}
              {/*        freeSolo*/}
              {/*        renderTags={(value, getTagProps) =>*/}
              {/*            value.map((option, index) => (*/}
              {/*                <Chip variant="outlined" name="associative_categories"*/}
              {/*                      label={option} {...getTagProps({index})} />*/}
              {/*            ))*/}
              {/*        }*/}
              {/*        renderInput={(params) => (*/}
              {/*            <TextField*/}
              {/*                name="associative_categories"*/}
              {/*                {...params}*/}
              {/*                variant="filled"*/}
              {/*                label="Associative Categories"*/}
              {/*                placeholder="Associative Categories"*/}
              {/*            />*/}
              {/*        )}*/}
              {/*    />*/}
              {/*</Box>*/}
            </Col>
          </Row>
        </Form>
      </Container>
    </>
  );
}
